// offer-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Offer extends Model {}

Offer.init(
  {
    id_offer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quotationrequest: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    hour: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    estimatedstart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedend: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize: db,
    modelName: 'Offer',
    tableName: 'offer',
    timestamps: false // Disable timestamps
  }
);

export default Offer;
