import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class PurchaseRow extends Model {}

PurchaseRow.init(
  {
    id_purchaserow: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    id_purchase: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    depreciation: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    depreciation_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    asset: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    taxed_unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    totalprice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    taxed_totalprice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subsubcategory: {
      type: DataTypes.INTEGER(50),
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: 'PurchaseRow',  
    tableName: 'purchaserow',  
    timestamps: false // Disabilita i timestamp automatici
  }
);

export default PurchaseRow;
