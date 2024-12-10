// role-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class EventType extends Model {}

EventType.init(
  {
    id_eventtype: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  },
  {
    sequelize: db,
    modelName: 'EventType',
    tableName: 'eventtype',
    paranoid: true // Enable soft deletes
  }
);

export default EventType;
