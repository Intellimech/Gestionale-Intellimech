// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Notification extends Model {}

Notification.init(
  {
    id_notify: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    receiver: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    viewed: {
        type: DataTypes.BOOLEAN,
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
    modelName: 'Notification',
    tableName: 'notification', // Make sure it matches your table name
    paranoid: true // Enable soft deletes
  }
);

export default Notification;
