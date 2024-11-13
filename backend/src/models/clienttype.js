// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class ClientType extends Model {}

ClientType.init(
  {
    id_clienttype: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING(255),
      },
    description: {
        type: DataTypes.STRING(255),
      },
  },
  {
    sequelize: db,
    modelName: 'ClientType',
    tableName: 'clienttype', // Make sure it matches your table name
  }
);

export default ClientType;
