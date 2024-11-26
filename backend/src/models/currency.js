// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Currency extends Model {}

Currency.init(
  {
    id_currency: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING,
      }
  },
  {
    sequelize: db,
    modelName: 'Currency',
    tableName: 'currency', // Make sure it matches your table name
  }
);

export default Currency;
