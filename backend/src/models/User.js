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
      type: DataTypes.STRING(100), // Modificato da 255 a 100
      allowNull: true,
      defaultValue: null
    },
    surname: {
      type: DataTypes.STRING(100), // Modificato da 255 a 100
      allowNull: true,
      defaultValue: null
    },
    birthdate: {
      type: DataTypes.DATE, // Modificato per utilizzare il tipo corretto
      allowNull: true,
      defaultValue: null
    },
    username: {
      type: DataTypes.STRING(200), // Modificato da 255 a 200
      allowNull: true,
      defaultValue: null
    },
    email: {
      type: DataTypes.STRING(255), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    password: {
      type: DataTypes.STRING(255), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    isActive: {
      type: DataTypes.BOOLEAN, // Modificato da TINYINT a BOOLEAN
      allowNull: true,
      defaultValue: null
    },
    isDeleted: {
      type: DataTypes.BOOLEAN, // Modificato da TINYINT a BOOLEAN
      allowNull: true,
      defaultValue: null
    },
    lastLoginAt: {
      type: DataTypes.DATE, // Modificato per utilizzare il tipo corretto
      allowNull: true,
      defaultValue: null
    },
    lastLoginIp: {
      type: DataTypes.STRING(255), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW // Usa NOW come valore predefinito
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW // Usa NOW come valore predefinito
    },
    deletedAt: {
      type: DataTypes.DATE, // Modificato per aggiungere deletedAt
      allowNull: true,
      defaultValue: null
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    group: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    subGroup: {
      type: DataTypes.INTEGER, // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    contractType: {
      type: DataTypes.INTEGER, // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    workingSite: {
      type: DataTypes.INTEGER, // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    hWeek: {
      type: DataTypes.INTEGER, // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    TaxIdCode: {
      type: DataTypes.STRING(25), // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    Phone: {
      type: DataTypes.STRING(20), // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    institute: {
      type: DataTypes.STRING(20), // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    qualification: {
      type: DataTypes.STRING(20), // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    hiringdate: {
      type: DataTypes.DATE, // Aggiunto hiringdate
      allowNull: true,
      defaultValue: null
    },
    drivingLicenseExp: {
      type: DataTypes.DATE, // Modificato per allinearsi al nome della colonna
      allowNull: true,
      defaultValue: null
    },
    country: {
      type: DataTypes.STRING(50), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    streetaddress: {
      type: DataTypes.STRING(255), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    city: {
      type: DataTypes.STRING(100), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    province: {
      type: DataTypes.STRING(100), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    zip: {
      type: DataTypes.STRING(10), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    sessionId: {
      type: DataTypes.STRING(255), // Rimane invariato
      allowNull: true,
      defaultValue: null
    },
    changepass: {
      type: DataTypes.BOOLEAN, // Rimane invariato
      defaultValue: true
    },
    birthprovince: {
      type: DataTypes.STRING(50), // Aggiunto birthprovince
      allowNull: true,
      defaultValue: null
    },
    businessphone: {
      type: DataTypes.STRING(50), // Aggiunto businessphone
      allowNull: true,
      defaultValue: null
    }
  },
  {
    sequelize: db,
    modelName: 'User',
    tableName: 'user',
    timestamps: false, // Mantieni false se non utilizzi timestamp automatici
  }
);

export default User;
