// subgroup-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Subgroup extends Model {}

Subgroup.init(
  {
    id_subgroup: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedBy: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize: db,
    modelName: 'Subgroup',
    tableName: 'subgroup',
    timestamps: true, // Enable timestamps
    paranoid: true // Enable soft deletes
  }
);

export default Subgroup;
