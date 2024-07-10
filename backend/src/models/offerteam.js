// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class OfferTeam extends Model {}

OfferTeam.init(
  {
    id_offerteam: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    offer: {
        type: DataTypes.INTEGER
      },
    user: {
        type: DataTypes.INTEGER
      },
  },
  {
    sequelize: db,
    modelName: 'OfferTeam',
    tableName: 'offerteam', // Make sure it matches your table name
  }
);

export default OfferTeam;
