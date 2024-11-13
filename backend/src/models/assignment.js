// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Assignment extends Model {}

Assignment.init(
  {
    id_assignment: {
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
    modelName: 'Assignment',
    tableName: 'assignment', // Make sure it matches your table name
  }
);

export default Assignment;
