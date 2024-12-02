import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class ContractRow extends Model {}

ContractRow.init(
  {
    id_contractrow: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_contract: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    unit_price_vat: {
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
    total_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    total_price_vat: {
      type: DataTypes.DOUBLE,
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
