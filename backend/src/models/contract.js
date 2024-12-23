import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Contract extends Model {}

Contract.init(
  {
    id_contract: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    referent: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IVA: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },taxed_total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    // New fields for contract
    recurrence: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    job: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deposit: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    recurrence_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contract_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    contract_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    banktransfer: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "In Approvazione"
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize: db,
    modelName: 'Contract',
    tableName: 'contract',
    timestamps: false // Disable automatic timestamps
  }
);

export default Contract;