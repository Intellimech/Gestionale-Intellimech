// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class JobSalesOrder extends Model {}

JobSalesOrder.init(
  {
    id_jobsalesorder: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    job: {
        type: DataTypes.INTEGER
      },
    salesorder: {
        type: DataTypes.INTEGER
      },
  },
  {
    sequelize: db,
    modelName: 'JobSalesOrder',
    tableName: 'jobsalesorder', // Make sure it matches your table name
  }
);

export default JobSalesOrder;
