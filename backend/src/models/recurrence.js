// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Recurrence extends Model {}

Recurrence.init(
  {
    id_recurrence: {
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
    modelName: 'Recurrence',
    tableName: 'recurrence', // Make sure it matches your table name
  }
);

export default Recurrence;
