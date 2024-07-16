import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Product extends Model {}

Product.init(
  {
    id_purchaserow: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_purchase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase',
        key: 'id_purchase'
      }
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
    subcategory: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize: db,
    modelName: 'Product',  
    tableName: 'purchaserow',  
    timestamps: false // Disabilita i timestamp automatici
  }
);

export default Product;
