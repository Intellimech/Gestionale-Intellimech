// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Calendar extends Model {}

Calendar.init(
  {
    id_calendar: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    location: {
        type: DataTypes.STRING(255),
      },
    date: {
        type: DataTypes.DATE,
      },
    period: {
        type: DataTypes.STRING(255),
      },
    owner: {
        type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.STRING(255),
  },
    createdBy: {
        type: DataTypes.INTEGER,
    },
    updatedBy: {
        type: DataTypes.INTEGER,
    },
    deletedBy: {
        type: DataTypes.INTEGER,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
    deletedAt: {
        type: DataTypes.DATE,
    }
  },
  {
    sequelize: db,
    modelName: 'Calendar',
    tableName: 'calendar', // Make sure it matches your table name
  }
);

export default Calendar;
