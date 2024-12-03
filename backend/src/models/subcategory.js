// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Subcategory extends Model {}

Subcategory.init(
  {
    id_subcategory: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING,
      },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      aliquota: {
        type: DataTypes.DOUBLE(255),
      },
      years: {
        type: DataTypes.DOUBLE(255),
      },
  },
  {
    sequelize: db,
    modelName: 'Subcategory',
    tableName: 'subcategory', // Make sure it matches your table name
  }
);

export default Subcategory;
