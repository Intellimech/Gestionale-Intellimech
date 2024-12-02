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
    const Recurrence = sequelize.models.Recurrence;

    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    Recurrence.findAll({
   
    })
    .then((recurrences) => {
        if (recurrences) {
            res.status(200).json({
                message: "Recurrences found",
                recurrences: recurrences,
            });
        } else {
            res.status(400).json({
                message: "Recurrences do not exist",
            });
        }
    })
    .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;