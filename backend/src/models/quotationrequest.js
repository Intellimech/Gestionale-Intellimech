// quotationrequest-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class QuotationRequest extends Model {}

QuotationRequest.init(
  {
    id_quotationrequest: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subcategory: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    technicalarea: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    company: {
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
      allowNull: true
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
    modelName: 'QuotationRequest',
    tableName: 'quotationrequest',
    timestamps: false // Disable timestamps
  }
);

export default QuotationRequest;
