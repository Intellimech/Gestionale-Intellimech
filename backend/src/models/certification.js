// role-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Certification extends Model {}

Certification.init(
  {
    id_certification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  },
  {
    sequelize: db,
    modelName: 'Certification',
    tableName: 'certification',
    paranoid: true // Enable soft deletes
  }
);

export default Certification;
