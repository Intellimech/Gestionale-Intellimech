// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Log extends Model {}

Log.init(
  {
    id_log: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
    level: {
        type: DataTypes.ENUM('success', 'info', 'warning', 'error', 'debug')
      },
    module: {
        type: DataTypes.STRING(255)
      },
    ip_address: {
        type: DataTypes.STRING(255)
      },
    message: {
        type: DataTypes.STRING(255)
      }
  },
  {
    sequelize: db,
    modelName: 'Log',
    tableName: 'log', // Make sure it matches your table name
    paranoid: true // Enable soft deletes
  }
);

export default Log;
