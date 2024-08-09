import axios from 'axios';
import sequelize from "../utils/db.js"; // Ensure the correct path
import { Op } from 'sequelize'; // Correct import of Op
import { Mutex } from 'async-mutex'; // Import the mutex library
import xml2js from 'xml2js'; // Import the xml2js library

const Company = sequelize.models.Company;
const Invoice = sequelize.models.Invoices;
const cleanRegex = /\u0004\u002A|\u0004|\u0003|\u0001e|\u0001|\u0008|\u0000|�|\)|\r|\n|\u0002@|\u0002/g;
const mutex = new Mutex(); // Create a mutex instance

async function getLastInvoiceSaved(invoiceType) {
  const lastInvoice = await Invoice.findOne({
    attributes: ['DoceasyID'],
    where: {
      InvoiceType: invoiceType
    },
    order: [['DoceasyID', 'DESC']]
  });
  return lastInvoice;
}

async function generateCompanyCode() {
  const release = await mutex.acquire(); // Acquire the mutex lock
  try {
    // Find the highest current company code
    const lastCompany = await Company.findOne({
      attributes: ['Code'], // Ensure this matches the actual column in the database
      order: [['id_company', 'DESC']], // Assuming 'id_company' is auto-incrementing
    });

    // Determine the next code number
    const prefix = 'C'; // Prefix for the company code
    const lastCode = lastCompany && lastCompany.Code ? lastCompany.Code : `${prefix}00000`; // Default code if no previous company code

    const lastNumber = parseInt(lastCode.replace(/^C/, ''), 10);
    const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;

    // Format as C00001
    const newCode = `${prefix}${String(nextNumber).padStart(5, '0')}`;

    return newCode;
  } finally {
    release(); // Release the mutex lock
  }
}

async function generateInvoiceCode(invoice) {
  const release = await mutex.acquire(); // Acquire the mutex lock
  try {
    const currentYear = new Date(invoice.Data).getFullYear().toString().slice(-2); // Get the last 2 digits of the current year
    const prefix = 'FT' + (invoice.TipoFattura === 'AttivaSdI' ? 'A' : 'P');

    // Find the highest current invoice code for the current year
    const lastInvoice = await Invoice.findOne({
      attributes: ['name'], // Ensure this matches the actual column in the database
      where: {
        name: {
          [Op.like]: `${prefix}${currentYear}_%` // Filter by year prefix
        }
      },
      order: [['name', 'DESC']] // Order by the code in descending order
    });

    // Determine the next code number
    let nextNumber = 1; // Default to 1 if no previous invoices exist

    if (lastInvoice && lastInvoice.name) {
      const lastCode = lastInvoice.name;
      const parts = lastCode.split('_');
      if (parts.length > 1) {
        const lastNumber = parseInt(parts[1], 10);
        nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }
    }

    // Format as FTA24_00001
    const formattedNumber = String(nextNumber).padStart(5, '0');
    const invoiceCode = `${prefix}${currentYear}_${formattedNumber}`;

    return invoiceCode;
  } finally {
    release(); // Release the mutex lock
  }
}

async function createCompany(invoice) {
  try {
    const companyCode = await generateCompanyCode();

    const company = await Company.create({
      Code: companyCode,
      VAT: invoice.PartitaIva,
      Fiscal_Code: invoice.CodiceFiscale,
      name: invoice.Denominazione,
      isClient: invoice.TipoFattura === 'AttivaSdI',
      isSuppliers: invoice.TipoFattura === 'PassivaSdI',
    });

    return company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

async function updateCompany(invoice) {
  try {
    const company = await Company.findOne({
      where: {
        VAT: invoice.PartitaIva,
        Fiscal_Code: invoice.CodiceFiscale,
      }
    });

    if (!company) {
      return await createCompany(invoice);
    }

    if (invoice.TipoFattura === 'AttivaSdI') {
      company.isClient = true;
    }

    if (invoice.TipoFattura === 'PassivaSdI') {
      company.isSuppliers = true;
    }

    if (invoice.Denominazione !== company.name) {
      company.name = invoice.Denominazione;
    }

    await company.save();
    return company;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

async function createInvoice(invoice, company) {
  try {
    const invoiceCode = await generateInvoiceCode(invoice);

    const newInvoice = await Invoice.create({
      name: invoiceCode,
      DoceasyID: invoice.ID,
      DocumentType: invoice.TipoDocumento,
      InvoiceType: invoice.TipoFattura,
      InvoiceCompany: company.id_company,
      Number: invoice.Numero,
      Date: invoice.Data,
      ReceptionDate: invoice.DataRicezione,
      Amount: invoice.Importo,
      ClientOutcome: invoice.EsitoCommittente,
      FileName: invoice.NomeFile,
      SDIIdentifier: invoice.IdentificativoSdI,
      LastMessage: invoice.UltimoMessaggio,
      Stored: invoice.Conservato,
      DocumentStatus: invoice.StatoDocumento,
    });
    const invoiceId = newInvoice.DoceasyID;

  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

async function saveInvoice(invoices) {
  try {
    for (const invoice of invoices) {
      let company;

      // Check if VAT or Fiscal Code is provided and try to find the company
      if (invoice.PartitaIva || invoice.CodiceFiscale) {
        const whereClause = {};

        if (invoice.PartitaIva) {
          whereClause.VAT = invoice.PartitaIva;
        }

        if (invoice.CodiceFiscale) {
          whereClause.Fiscal_Code = invoice.CodiceFiscale;
        }

        company = await Company.findOne({ where: whereClause });
      }

      if (!company) {
        // If the company is not found, create a new one
        company = await createCompany(invoice);
      } else {
        if (!company.VAT && invoice.PartitaIva) {
          // Update the missing VAT number
          company.VAT = invoice.PartitaIva;
          await company.save();
        } else if (company.VAT && !invoice.PartitaIva) {
          // If the VAT number is present in the company but missing in the invoice
          invoice.PartitaIva = company.VAT;
        }
      }

      await createInvoice(invoice, company);
    }
  } catch (error) {
    console.error('Error saving invoices:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

async function getInvoices() {
  const headers = {
    'APIKey': process.env.DOCEASY_APIKEY,
    'APISecret': process.env.DOCEASY_APISECRET,
    'PartitaIva': process.env.DOCEASY_CODICECLIENTE
  };

  const activeLastInvoice = await getLastInvoiceSaved("AttivaSdI");
  const passiveLastInvoice = await getLastInvoiceSaved("PassivaSdI");

  const activeInvoiceId = activeLastInvoice?.DoceasyID ?? 0;
  const passiveInvoiceId = activeLastInvoice?.DoceasyID ?? 0;

  const passiveResponse = await axios.get(`${process.env.DOCEASY_URL}/api/documentopassivo/elenco/${activeInvoiceId}`, { headers });
  const passiveInvoices = passiveResponse.data;

  const activeResponse = await axios.get(`${process.env.DOCEASY_URL}/api/documentoattivo/elenco/${passiveInvoiceId}`, { headers });
  const activeInvoices = activeResponse.data;

  return [...passiveInvoices, ...activeInvoices];
}

async function startDoceasy() {
  try {
    const invoices = await getInvoices();
    await saveInvoice(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

export { startDoceasy };
