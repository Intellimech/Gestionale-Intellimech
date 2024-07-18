import axios from 'axios';
import logger from '../utils/logger.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';
import { Mutex } from 'async-mutex';  // Ensure to install async-mutex

class Doceasy {
  constructor() {
    this.baseUrl = process.env.DOCEASY_URL;
    this.company = sequelize.models.Company;
    this.headers = {
      'APIKey': process.env.DOCEASY_APIKEY,
      'APISecret': process.env.DOCEASY_APISECRET,
      'PartitaIva': process.env.DOCEASY_CODICECLIENTE
    };
    this.codeMutex = new Mutex();
  }

  async checkServer() {
    try {
      await axios.get(`${this.baseUrl}/api/about/version`);
      logger('success', 'Doceasy server is up and running', null, 'doceasy');
    } catch (error) {
      logger('error', `Doceasy server is down: ${error.message}`, error, 'doceasy');
    }
  }

  async getInvoices(url, type) {
    try {
      const response = await axios.get(url, { headers: this.headers });
      const invoices = response.data;
      for (const invoice of invoices) {
        await this.checkCompany(invoice);
      }
      logger('success', `${type} invoices retrieved successfully`, null, 'doceasy');
    } catch (error) {
      logger('error', `Error retrieving ${type} invoices: ${error.message}`, error, 'doceasy');
    }
  }

  async getActiveInvoices() {
    await this.getInvoices(`${this.baseUrl}/api/documentoattivo/elenco/`, 'Active');
  }

  async getPassiveInvoices() {
    await this.getInvoices(`${this.baseUrl}/api/documentopassivo/elenco/`, 'Passive');
  }

  async createCompany(invoice) {
    try {
      const code = await this.generateCode();
      const companyData = this.buildCompanyData(invoice, code);

      await this.company.create(companyData);
      // logger('success', 'Company created successfully', null, 'doceasy');
    } catch (error) {
      // logger('error', `Error creating company: ${error.message}`, error, 'doceasy');
    }
  }

  buildCompanyData(invoice, code = null) {
    const companyData = {
      Code: code,
      name: invoice?.Denominazione || null,
      SDI: invoice?.IdentificativoSdI || null,
      isClient: invoice?.TipoFattura === 'AttivaSdI' ? true : false,
      isSuppliers: invoice?.TipoFattura === 'PassivaSdI' ? true : false,
    };

    if (invoice?.PartitaIva) {
      companyData.VAT = invoice.PartitaIva;
    }
    if (invoice?.CodiceFiscale) {
      companyData.Fiscal_Code = invoice.CodiceFiscale;
    }

    return companyData;
  }

  async checkCompany(invoice) {
    try {
      const company = await this.findCompany(invoice);

      if (company) {
        await this.updateCompanyIfNeeded(company, invoice);
        return company.id_company;
      } else {
        await this.createCompany(invoice);
      }
    } catch (error) {
      // logger('error', `Error checking or updating company: ${error.message}`, error, 'doceasy');
    }
  }

  async findCompany(invoice) {
    const queryCriteria = this.buildQueryCriteria(invoice);

    if (queryCriteria.length === 0) {
      throw new Error('No valid criteria to find the company');
    }

    return await this.company.findOne({
      where: {
        [Op.or]: queryCriteria
      }
    });
  }

  buildQueryCriteria(invoice) {
    const queryCriteria = [];

    if (invoice?.PartitaIva) {
      queryCriteria.push({ VAT: invoice.PartitaIva });
    }
    if (invoice?.CodiceFiscale) {
      queryCriteria.push({ Fiscal_Code: invoice.CodiceFiscale });
    }
    if (invoice?.Denominazione) {
      queryCriteria.push({ name: invoice.Denominazione });
    }

    return queryCriteria;
  }

  async updateCompanyIfNeeded(company, invoice) {
    const updateData = this.buildUpdateData(company, invoice);

    if (Object.keys(updateData).length > 0) {
      await company.update(updateData);
      // logger('success', 'Updated company data', null, 'doceasy');
    } else {
      // logger('success', 'Company found and data is correct', null, 'doceasy');
    }
  }

  buildUpdateData(company, invoice) {
    const updateData = {};

    if (invoice?.PartitaIva && company.VAT !== invoice.PartitaIva) {
      updateData.VAT = invoice.PartitaIva;
    }
    if (invoice?.CodiceFiscale && company.Fiscal_Code !== invoice.CodiceFiscale) {
      updateData.Fiscal_Code = invoice.CodiceFiscale;
    }
    if (invoice?.Denominazione && company.name !== invoice.Denominazione) {
      updateData.name = invoice.Denominazione;
    }
    if (invoice?.TipoFattura === 'AttivaSdI' && company.isClient !== true) {
      updateData.isClient = true;
    }
    if (invoice?.TipoFattura === 'PassivaSdI' && company.isSuppliers !== true) {
      updateData.isSuppliers = true;
    }

    return updateData;
  }

  async generateCode() {
    const release = await this.codeMutex.acquire();
    try {
      let code;
      let unique = false;

      while (!unique) {
        const count = await this.company.count();
        code = `C${(count + 1).toString().padStart(6, '0')}`;

        // logger('info', `Generating company code: ${code}`, null, 'doceasy');
        const existingCompany = await this.company.findOne({
          where: { Code: code }
        });
        


        if (!existingCompany) {
          unique = true;
        }
      }
      
      return code;
    } catch (error) {
      // logger('error', `Error generating company code: ${error.message}`, error, 'doceasy');
      throw error;
    } finally {
      release();
    }
  }
}

export { Doceasy };
