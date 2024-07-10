import { Sequelize, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database connection mysql

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        define: {
        timestamps: false,
        },
    },
);
export default sequelize;