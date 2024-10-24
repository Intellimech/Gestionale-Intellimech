import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const CommercialOffer = sequelize.define("CommercialOffer", {
  id_commercialoffer: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  linkedTask: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_offer: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: false,
  modelName: "CommercialOffer",
  tableName: "commercialoffer",
});

export default CommercialOffer;
