import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Purchase extends Model {}

Purchase.init(
  {
    id_purchase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payment: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IVA: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
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
    }
  },
  {
    sequelize: db,
    modelName: 'Purchase',
    tableName: 'purchase',
    timestamps: false // Disable automatic timestamps
  }
);

export default Purchase;