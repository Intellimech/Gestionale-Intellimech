import axios from 'axios';
import logger from '../utils/logger.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';
import xml2js from 'xml2js';
import { Mutex } from 'async-mutex';

const baseUrl = process.env.DOCEASY_URL;
const headers = {
  'APIKey': process.env.DOCEASY_APIKEY,
  'APISecret': process.env.DOCEASY_APISECRET,
  'PartitaIva': process.env.DOCEASY_CODICECLIENTE
};
const codeMutex = new Mutex();
const parser = new xml2js.Parser({ explicitArray: false });

const Invoice = sequelize.models.Invoices;
const Company = sequelize.models.Company;

const cleanRegex = /\u0004\u002A|\u0004|\u0003|\u0001e|\u0001|\u0008|\u0000|�|\)|\r|\n|\u0002@|\u0002/g;

const checkServer = async () => {
  try {
    await axios.get(`${baseUrl}/api/about/version`);
    logger('success', 'Doceasy server is up and running', null, 'doceasy');
  } catch (error) {
    logger('error', `Doceasy server is down: ${error.message}`, error, 'doceasy');
  }
};

const generateCompanyCode = async () => {
  return await codeMutex.runExclusive(async () => {
    const companyCount = await Company.count();
    return `C${(companyCount + 1).toString().padStart(5, '0')}`;
  });
};

const generateInvoiceCode = async (invoice) => {
  const type = invoice.TipoFattura;
  return await codeMutex.runExclusive(async () => {
    const invoiceCount = await Invoice.count({ 
      where: [
        { InvoiceType: type === 'AttivaSdI' ? 'Attiva' : 'Passiva' },
        sequelize.where(sequelize.fn('YEAR', sequelize.col('Date')), new Date(invoice.Data).getFullYear())
      ]
    });
    const year = new Date(invoice.Data).getFullYear().toString().slice(-2);
    const prefix = type === 'AttivaSdI' ? `FTA${year}_` : `FTP${year}_`;
    return `${prefix}${(invoiceCount + 1).toString().padStart(5, '0')}`;
  });
};

const fetchInvoiceXML = async (invoice, invoiceType) => {
  const url = `${baseUrl}/api/documento${invoiceType === 'PassivaSdI' ? 'passivo' : 'attivo'}/${invoice.ID}/file`;
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    logger('error', `Error while fetching XML file for invoice ${invoice.ID}: ${error.message}`, error, 'doceasy');
    throw error;
  }
};

const isValidXML = (xml) => {
  return xml.trim().startsWith('<');
};

const parseInvoiceXML = async (xml) => {
  if (!isValidXML(xml)) {
    throw new Error('Invalid XML format');
  }
  try {
    const cleanedXml = xml.trim().replace(cleanRegex, '');
    return await parser.parseStringPromise(cleanedXml);
  } catch (parseError) {
    logger('error', `Error while parsing XML: ${parseError.message}`, parseError, 'doceasy');
    throw parseError;
  }
};

const processCompany = async (invoice) => {
  const {
    Denominazione,
    PartitaIva,
    CodiceFiscale,
    SDI,
    PEC,
    Indirizzo,
    CAP,
    Comune,
    Provincia,
    Nazione,
    TipoFattura
  } = invoice;

  console.log(TipoFattura);

  let company = await Company.findOne({
    where: {
      [Op.or]: [
        { VAT: PartitaIva },
        { Fiscal_Code: CodiceFiscale }
      ]
    }
  });

  if (!company) {
    const companyCode = await generateCompanyCode();
    company = await Company.create({
      Code: companyCode,
      name: Denominazione,
      VAT: PartitaIva,
      Fiscal_Code: CodiceFiscale,
      SDI,
      PEC,
      Address: Indirizzo,
      ZIP: CAP,
      City: Comune,
      Province: Provincia,
      Country: Nazione,
      isClient: TipoFattura == "AttivaSdI",
      isSuppliers: TipoFattura == "PassivaSdI",
      isPartner: false
    });
  } else {
    const updatedFields = {
      name: Denominazione || company.name,
      SDI: SDI || company.SDI,
      PEC: PEC || company.PEC,
      Address: Indirizzo || company.Address,
      ZIP: CAP || company.ZIP,
      City: Comune || company.City,
      Province: Provincia || company.Province,
      Country: Nazione || company.Country,
      isClient: TipoFattura == "AttivaSdI" || company.isClient,
      isSuppliers: TipoFattura == "PassivaSdI" || company.isSuppliers
    };

    const hasChanges = Object.keys(updatedFields).some(key => updatedFields[key] !== company[key]);
    
    if (hasChanges) {
      Object.assign(company, updatedFields);
      logger('info', `Updating company: ${JSON.stringify(company)}`, null, 'doceasy');
      await company.save();
    } else {
      logger('info', `No changes for company: ${JSON.stringify(company)}`, null, 'doceasy');
    }
  }

  return company;
};

const processInvoice = async (invoice, company) => {
  try {
    const invoiceCode = await generateInvoiceCode(invoice);

    // Save the invoice data (without XML)
    const savedInvoice = await Invoice.create({
      name: invoiceCode,
      DoceasyID: invoice.ID,
      DocumentType: invoice.TipoDocumento,
      InvoiceType: invoice.TipoFattura === 'PassivaSdI' ? 'Passiva' : 'Attiva',
      InvoiceCompany: company.id_company,
      Number: invoice.Numero,
      Date: invoice.Data,
      ReceptionDate: invoice.DataRicezione,
      Amount: invoice.Importo,
      ClientOutcome: invoice.EsitoCliente,
      FileName: invoice.NomeFile,
      SDIIdentifier: invoice.IdentificativoSDI,
      LastMessage: invoice.UltimoMessaggio,
      Stored: invoice.Conservato === 'true',
      DocumentStatus: invoice.StatoDocumento,
    });

    logger('success', `Invoice ${invoice.ID} saved successfully`, null, 'doceasy');

    return savedInvoice;
  } catch (error) {
    logger('error', `Error processing invoice ${invoice.ID}: ${error.message}`, error, 'doceasy');
    return null;
  }
};

const updateInvoiceWithXML = async (invoiceId, xml) => {
  try {
    const parsedXml = await parseInvoiceXML(xml);
    const invoice = await Invoice.findByPk(invoiceId);
    invoice.file = parsedXml;
    await invoice.save();
    logger('success', `Invoice ${invoiceId} updated with XML successfully`, null, 'doceasy');
  } catch (error) {
    logger('error', `Error updating invoice ${invoiceId} with XML: ${error.message}`, error, 'doceasy');
  }
};

const fetchAndProcessInvoices = async (url, tipoFattura) => {
  try {
    const response = await axios.get(url, { headers });
    const invoices = response.data;
    for (const invoice of invoices) {
      try {
        const company = await processCompany(invoice);
        const processedInvoice = await processInvoice(invoice, company);
        if (processedInvoice && processedInvoice.TipoDocumento !== 'TD17') {
          const xml = await fetchInvoiceXML(invoice, invoice.TipoFattura);
          await updateInvoiceWithXML(processedInvoice.id, xml);
        }
      } catch (invoiceError) {
        logger('error', `Skipping invoice ${invoice.ID} due to error: ${invoiceError.message}`, invoiceError, 'doceasy');
      }
    }
  } catch (error) {
    logger('error', `Error while fetching ${tipoFattura} invoices: ${error.message}`, error, 'doceasy');
  }
};

const importInvoices = async () => {
  const lastInvoice = await Invoice.findOne({ order: [['DoceasyID', 'DESC']] });
  const lastId = lastInvoice ? lastInvoice.DoceasyID : "";

  await fetchAndProcessInvoices(`${baseUrl}/api/documentopassivo/elenco/${lastId}`, 'passive');
  await fetchAndProcessInvoices(`${baseUrl}/api/documentoattivo/elenco/`, 'active');
};

export { checkServer, importInvoices, processInvoice, processCompany, generateCompanyCode, generateInvoiceCode };
