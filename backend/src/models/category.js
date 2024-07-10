// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Category extends Model {}

Category.init(
  {
    id_category: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING(255),
      },
  },
  {
    sequelize: db,
    modelName: 'Category',
    tableName: 'category', // Make sure it matches your table name
  }
);

export default Category;
