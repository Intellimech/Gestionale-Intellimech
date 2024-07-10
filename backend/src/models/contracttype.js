// contracttype-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class ContractType extends Model {}

ContractType.init(
  {
    id_contracttype: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    updatedBy: {
      type: DataTypes.INTEGER
    },
    deletedBy: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize: db,
    modelName: 'ContractType',
    tableName: 'contracttype',
    timestamps: true, // Enable timestamps
    paranoid: true // Enable soft deletes
  }
);

export default ContractType;
