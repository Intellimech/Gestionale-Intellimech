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
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalprice: {
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
  },
  {
    sequelize: db,
    modelName: 'PurchaseRow',  
    tableName: 'purchaserow',  
    timestamps: false // Disabilita i timestamp automatici
  }
);

export default PurchaseRow;
