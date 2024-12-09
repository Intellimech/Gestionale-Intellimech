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
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IVA: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }, taxed_total: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "In Approvazione"
    }, 
    banktransfer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    referent: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    //Add owner field - Who asked for the purchase
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
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purchaserows: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.PurchaseRows) {
          return this.PurchaseRows.length;
        }
        return 0;
      },
    },
  },
  {
    sequelize: db,
    modelName: 'Purchase',
    tableName: 'purchase',
    timestamps: false // Disable automatic timestamps
  }
);

export default Purchase;