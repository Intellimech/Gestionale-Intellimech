import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    // Get the recurrence from the database
    const MailingList = sequelize.models.MailingList;

    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    MailingList.findAll({
        attributes: ['id_mailinglist', 'name', 'description'],
        include: [
            {
                model: sequelize.models.User,
                as: 'mailinglistusers',
                attributes: ['email', 'name', 'surname']
            }
        ]
    }).then((mailinglist) => {
        res.status(200).json(mailinglist);
    }).catch((error) => {
        Logger('error', error, 'mailinglistread');
        res.status(500).json({ message: 'Internal server error' });
    });
});

export default router;