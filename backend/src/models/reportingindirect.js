// role-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class ReportingIndirect extends Model {}

ReportingIndirect.init(
  {
    id_reportingindirect: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    needEventInput: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        },
    needTextInput: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        },
    TextInputName: {
        type: DataTypes.STRING(255),
        allowNull: true
        },
    needCompanyInput: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        },
    needJobInput: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        },
    parentIndirect: {
        type: DataTypes.INTEGER,
        allowNull: true
        },
    needCertificationInput: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        },
  },
  {
    sequelize: db,
    modelName: 'ReportingIndirect',
    tableName: 'reportingindirect',
    paranoid: true // Enable soft deletes
  }
);

export default ReportingIndirect;
