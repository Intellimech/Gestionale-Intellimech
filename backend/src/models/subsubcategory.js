// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Subsubcategory extends Model {}

Subsubcategory.init(
  {
    id_subsubcategory: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING,
      },
    subcategory: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },  aliquota: {
        type: DataTypes.DOUBLE(255),
      },
      years: {
        type: DataTypes.DOUBLE(255),
      },
  },
  {
    sequelize: db,
    modelName: 'Subsubcategory',
    tableName: 'subsubcategory', // Make sure it matches your table name
  }
);

export default Subsubcategory;
