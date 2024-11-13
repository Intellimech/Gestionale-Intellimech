// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class ProjectType extends Model {}

ProjectType.init(
  {
    id_projecttype: {
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
    modelName: 'ProjectType',
    tableName: 'projecttype', // Make sure it matches your table name
  }
);

export default ProjectType;
