// group-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class MailingListUser extends Model {}

MailingListUser.init(
  {
    id_mailinglistuser: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mailinglist: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  },
  {
    sequelize: db,
    modelName: 'MailingListUser',
    tableName: 'mailinglistuser',
    timestamps: false, // Enable timestamps
  }
);

export default MailingListUser;
