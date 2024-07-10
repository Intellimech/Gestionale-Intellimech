// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class TechnicalArea extends Model {}

TechnicalArea.init(
  {
    id_technicalarea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING(255),
      },
    code: {
        type: DataTypes.STRING(255),
      },
  },
  {
    sequelize: db,
    modelName: 'TechnicalArea',
    tableName: 'technicalarea', // Make sure it matches your table name
  }
);

export default TechnicalArea;
