// group-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class WorkingSite extends Model {}

WorkingSite.init(
  {
    id_workingsite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SiteCode: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    GeneralName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    region: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    province: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    postalCode: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    street: {
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
    createdBy: {
        type: DataTypes.INTEGER
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedBy: {
        type: DataTypes.INTEGER
    }
  },
  {
    sequelize: db,
    modelName: 'WorkingSite',
    tableName: 'workingsite',
    timestamps: true, // Enable timestamps
  }
);

export default WorkingSite;
