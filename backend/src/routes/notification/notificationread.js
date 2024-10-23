import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import { Sequelize, Op } from 'sequelize';
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/me", (req, res) => {
    //get from the db all the notifications
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const publicKey = fs.readFileSync(
        path.resolve(__dirname, "./src/keys/public.key")
    );

   

    const notification = sequelize.models.Notification;

    notification.findAll({
        where: {
            receiver: user.id_user
        },
        include: [
            {
                model: sequelize.models.User,
                as: 'ownerUser',
                attributes: ['name', 'surname']
            }
        ]
    }).then((notifications) => {
        res.status(200).send({
            message: 'Notifications found',
            notification: notifications
        });
    }).catch((error) => {
        Logger('error', error, null, 'notificationread');
        res.status(500).send(error);
    });
});

export default router;