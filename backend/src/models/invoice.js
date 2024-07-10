// active-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Invoices extends Model {}

Invoices.init(
  {
    id_invoices: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DoceasyID: {
      type: DataTypes.INTEGER
    },
    DocumentType: {
      type: DataTypes.STRING(20)
    },
    InvoiceType: {
      type: DataTypes.STRING(20)
    },
    InvoiceCompany: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Number: {
      type: DataTypes.STRING(50)
    },
    Date: {
      type: DataTypes.DATE
    },
    ReceptionDate: {
      type: DataTypes.DATE
    },
    Amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    ClientOutcome: {
      type: DataTypes.STRING(255)
    },
    FileName: {
      type: DataTypes.STRING(255)
    },
    SDIIdentifier: {
      type: DataTypes.STRING(50)
    },
    LastMessage: {
      type: DataTypes.STRING(255)
    },
    Stored: {
      type: DataTypes.BOOLEAN
    },
    DocumentStatus: {
      type: DataTypes.STRING(50)
    },
  },
  {
    sequelize: db,
    modelName: 'Invoices',
    tableName: 'invoices', // Make sure it matches your table name
    timestamps: false, // Enable timestamps
  }
);

export default Invoices;
