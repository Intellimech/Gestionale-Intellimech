// usersrole-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class usersrole extends Model {}

usersrole.init(
  {
    id_usersrole: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize: db,
    modelName: 'UsersRole',
    tableName: 'usersrole',
    timestamps: false // Disable timestamps
  }
);

export default usersrole;
