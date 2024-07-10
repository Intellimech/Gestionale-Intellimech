// purchase-order-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Purchase extends Model {}

Purchase.init(
  {
    id_purchase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    azienda: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    p_iva: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cf: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    iva: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  {
    sequelize: db,
    modelName: 'Purchase',
    tableName: 'purchase',
    timestamps: false // Disable timestamps
  }
);

export default Purchase;