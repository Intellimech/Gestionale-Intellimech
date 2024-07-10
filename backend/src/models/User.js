// user-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class User extends Model {}

User.init(
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    birthdate: {
      type: DataTypes.DATE
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    lastLoginIp: {
      type: DataTypes.STRING(255)
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    deletedBy: {
      type: DataTypes.INTEGER
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    updatedBy: {
      type: DataTypes.INTEGER
    },
    group: {
      type: DataTypes.INTEGER
    },
    subgroup: {
      type: DataTypes.INTEGER
    },
    contracttype: {
      type: DataTypes.INTEGER
    },
    hweek: {
      type: DataTypes.INTEGER
    },
    /*kmprice: {
      type: DataTypes.INTEGER
    },*/
    taxidcode: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING
    },
    drivinglicenseexp: {
      type: DataTypes.DATE
    },
    workingsite: {
      type: DataTypes.INTEGER
    },
    country: {
      type: DataTypes.STRING(50)
    },
    streetaddress: {
      type: DataTypes.STRING(255)
    },
    city: {
      type: DataTypes.STRING(100)
    },
    province: {
      type: DataTypes.STRING(100)
    },
    zip: {
      type: DataTypes.STRING(10)
    },
    sessionId: {
      type: DataTypes.STRING(255)
    },
    changepass: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize: db,
    modelName: 'User',
    tableName: 'user',
    timestamps: false, // Enable timestamps
  }
);

export default User;
