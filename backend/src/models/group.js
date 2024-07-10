// group-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Group extends Model {}

Group.init(
  {
    id_group: {
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
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    Color: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    LogoFilename: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize: db,
    modelName: 'Group',
    tableName: 'group',
    timestamps: true, // Enable timestamps
  }
);

export default Group;
