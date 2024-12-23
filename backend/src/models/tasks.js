// rolepermissions-model.js
import { DataTypes, Model } from 'sequelize';
import db from '../utils/db.js';

class Tasks extends Model {}

Tasks.init(
  {
    id_task: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hour: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_offer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    client: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    parentTask: {
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
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
    }
  },
  {
    sequelize: db,
    modelName: 'Tasks',
    tableName: 'tasks',
    timestamps: false // Disable timestamps
  }
);

export default Tasks;
