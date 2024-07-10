// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Category extends Model {}

Category.init(
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
      }
  },
  {
    sequelize: db,
    modelName: 'Subcategory',
    tableName: 'subcategory', // Make sure it matches your table name
  }
);

export default Category;
