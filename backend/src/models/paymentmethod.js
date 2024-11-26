// passive-invoice-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class PaymentMethod extends Model {}

PaymentMethod.init(
  {
    id_paymentmethod: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    name: {
        type: DataTypes.STRING,
      }
  },
  {
    sequelize: db,
    modelName: 'PaymentMethod',
    tableName: 'paymentmethod', // Make sure it matches your table name
  }
);

export default PaymentMethod;
