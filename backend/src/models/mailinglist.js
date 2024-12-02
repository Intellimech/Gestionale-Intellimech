// group-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class MailingList extends Model {}

MailingList.init(
  {
    id_mailinglist: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  },
  {
    sequelize: db,
    modelName: 'MailingList',
    tableName: 'mailinglist',
    timestamps: false, // Enable timestamps
  }
);

export default MailingList;
