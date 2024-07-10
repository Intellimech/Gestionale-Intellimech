// group-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class InvoiceLine extends Model {}

InvoiceLine.init(
  {
    id_invoiceline: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NumeroLinea: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
    Descrizione: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    Quantita: {
      type: DataTypes.DECIMAL(20, 2),
      defaultValue: false
    },
    DataInizioPeriodo: {
      type: DataTypes.DATE
    },
    DataFinePeriodo: {
      type: DataTypes.DATE,
    },
    PrezzoUnitario: {
      type: DataTypes.DECIMAL(20, 2),
    },
    PrezzoTotale: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    AliquotaIVA: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    invoice : {
        type: DataTypes.INTEGER,
        allowNull: false
        }
  },
  {
    sequelize: db,
    modelName: 'InvoiceLine',
    tableName: 'invoiceline',
  }
);

export default InvoiceLine;
