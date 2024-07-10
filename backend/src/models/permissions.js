// permission-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Permission extends Model {}

Permission.init(
  {
    id_permission: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    module: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    route: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    actionType: {
      type: DataTypes.ENUM('Create', 'Read', 'Update', 'Delete'),
      allowNull: false
    }
  },
  {
    sequelize: db,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: false // Disable timestamps
  }
);

export default Permission;
