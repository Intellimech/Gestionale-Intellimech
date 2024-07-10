import axios from 'axios';
import logger from '../utils/logger.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';

class Doceasy {
  constructor() {
    this.baseUrl = process.env.DOCEASY_URL;
    this.company = sequelize.models.Company;
    this.headers = {
      'APIKey': process.env.DOCEASY_APIKEY,
      'APISecret': process.env.DOCEASY_APISECRET,
      'PartitaIva': process.env.DOCEASY_CODICECLIENTE
    };
  }

  async checkServer() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/about/version`);
      logger('success', 'Doceasy server is up and running', null, 'doceasy');
    } catch (error) {
      logger('error', `Doceasy server is down: ${error.message}`, error, 'doceasy');
    }
  }

  async getActiveInvoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/documentoattivo/elenco/`, { headers: this.headers });
      const invoices = response.data;
      for (const invoice of invoices) {
        await this.checkCompany(invoice);
      }
      logger('success', 'Active invoices retrieved successfully', null, 'doceasy');
    } catch (error) {
      logger('error', `Error retrieving active invoices: ${error.message}`, error, 'doceasy');
    }
  }

  async getPassiveInvoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/documentopassivo/elenco/`, { headers: this.headers });
      const invoices = response.data;
      for (const invoice of invoices) {
        await this.checkCompany(invoice);
      }
      logger('success', 'Passive invoices retrieved successfully', null, 'doceasy');
    } catch (error) {
      logger('error', `Error retrieving passive invoices: ${error.message}`, error, 'doceasy');
    }
  }

  async createCompany(invoice) {
    try {
      const code = await this.generateCode();
      const companyData = {
        Code: code,
        name: invoice?.Denominazione || null,
        SDI: invoice?.IdentificativoSdI || null,
        isClient: invoice?.TipoFattura === 'AttivaSdI' ? true : false,
        isSuppliers: invoice?.TipoFattura === 'PassivaSdI' ? true : false
      };

      // Only set VAT and Fiscal_Code if they are provided
      if (invoice?.PartitaIva) {
        companyData.VAT = invoice.PartitaIva;
      }
      if (invoice?.CodiceFiscale) {
        companyData.Fiscal_Code = invoice.CodiceFiscale;
      }

      await this.company.create(companyData);
      logger('success', 'Company created successfully', null, 'doceasy');
    } catch (error) {
      logger('error', `Error creating company: ${error.message}`, error, 'doceasy');
    }
  }

  async checkCompany(invoice) {
    try {
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

      const company = await this.company.findOne({
        where: {
          [Op.or]: queryCriteria
        }
      });

      if (company) {
        // Update existing company data if found
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

        if (Object.keys(updateData).length > 0) {
          await company.update(updateData);
          logger('success', 'Updated company data', null, 'doceasy');
        } else {
          logger('success', 'Company found and data is correct', null, 'doceasy');
        }
        return company.id_company;
      } else {
        // Create new company if not found
        await this.createCompany(invoice);
      }
    } catch (error) {
      logger('error', `Error checking or updating company: ${error.message}`, error, 'doceasy');
    }
  }

  async generateCode() {
    try {
      const companies = await this.company.findAll();
      const counter = companies.length + 1;
      const code = `C${counter.toString().padStart(5, '0')}`;
      return code;
    } catch (error) {
      logger('error', `Error generating company code: ${error.message}`, error, 'doceasy');
      throw error;
    }
  }
}

export { Doceasy };
