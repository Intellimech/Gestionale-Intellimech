// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Location extends Model {}

Location.init(
  {
    id_location: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING(255),
      },
    hours: {
        type: DataTypes.FLOAT,
      },
  },
  {
    sequelize: db,
    modelName: 'Location',
    tableName: 'locations', // Make sure it matches your table name
  }
);

export default Location;
