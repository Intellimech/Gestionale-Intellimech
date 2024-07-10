// reporting-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Reporting extends Model {}

Reporting.init(
  {
    id_reporting: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    job: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    task: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    hour: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
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
    modelName: 'Reporting',
    tableName: 'reporting',
    timestamps: false // Disable timestamps
  }
);

export default Reporting;
