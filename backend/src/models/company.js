// company-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Company extends Model {}

Company.init(
  {
    id_company: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Code: {
      type: DataTypes.STRING(10), // Changed to match VARCHAR(10) in the SQL query
    },
    name: {
      type: DataTypes.STRING(255)
    },
    VAT: {
      type: DataTypes.STRING(15)
    },
    Fiscal_Code: {
      type: DataTypes.STRING(15)
    },
    SDI: {
      type: DataTypes.STRING(20)
    },
    PEC: {
      type: DataTypes.STRING(255)
    },
    Address: {
      type: DataTypes.STRING(255)
    },
    ZIP: {
      type: DataTypes.STRING(10)
    },
    City: {
      type: DataTypes.STRING(100)
    },
    Province: {
      type: DataTypes.STRING(10)
    },
    Country: {
      type: DataTypes.STRING(100)
    },
    isClient: {
      type: DataTypes.BOOLEAN, // Assuming TINYINT(1) represents boolean values
      defaultValue: false // Default value for boolean field
    },
    isSuppliers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPartner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize: db,
    modelName: 'Company',
    tableName: 'company',
    timestamps: false // Disable timestamps
  }
);

export default Company;
