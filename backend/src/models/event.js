// role-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Event extends Model {}

Event.init(
  {
    id_event: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    eventtype: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  },
  {
    sequelize: db,
    modelName: 'Event',
    tableName: 'event',
    paranoid: true // Enable soft deletes
  }
);

export default Event;
