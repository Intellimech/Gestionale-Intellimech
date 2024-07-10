// rolepermissions-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class rolepermissions extends Model {}

rolepermissions.init(
  {
    id_rolepermission: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_permissions: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize: db,
    modelName: 'RolePermissions',
    tableName: 'rolepermissions',
    timestamps: false // Disable timestamps
  }
);

export default rolepermissions;
