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
    description: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize: db,
    modelName: 'Product',  // Il nome del modello può rimanere 'Product'
    tableName: 'purchaserow',  // Nome della tabella nel database
    timestamps: false // Disabilita i timestamp automatici
  }
);

export default Product;
