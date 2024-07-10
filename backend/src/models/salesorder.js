// rolepermissions-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class salesorder extends Model {}

salesorder.init(
  {
    id_salesorder: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    offer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Da Fatturare'
    },
    notes: {
      type: DataTypes.STRING,
    }
  },
  {
    sequelize: db,
    modelName: 'SalesOrder',
    tableName: 'salesorder',
    timestamps: false // Disable timestamps
  }
);

export default salesorder;
