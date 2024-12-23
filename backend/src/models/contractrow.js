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
   taxed_unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    totalprice: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    taxed_totalprice: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    category: {
      type: DataTypes.INTEGER(50),
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.INTEGER(50),
      allowNull: false,
    },
    subsubcategory: {
      type: DataTypes.INTEGER(50),
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: 'ContractRow',  
    tableName: 'contractrow',  
  }
);

export default ContractRow;
