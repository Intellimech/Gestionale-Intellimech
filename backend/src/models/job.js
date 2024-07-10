// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Job extends Model {}

Job.init(
  {
    id_job: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING(255),
      },
    status: {
        type: DataTypes.STRING(255)
      },
    createdBy: {
        type: DataTypes.STRING(255)
      },
    updatedBy: {
        type: DataTypes.STRING(255)
      },
    deletedBy: {
        type: DataTypes.STRING(255)
      },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
    deletedAt: {
        type: DataTypes.DATE,
      }
  },
  {
    sequelize: db,
    modelName: 'Job',
    tableName: 'job', // Make sure it matches your table name
  }
);

export default Job;
