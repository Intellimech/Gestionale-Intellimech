import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.post("/approve/:id", (req, res) => {
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    // Get the role from the database
    const Calendar = sequelize.models.Calendar;

    Calendar.update({
        status: "Approvata",
    }, {
        where: {
            id_calendar: req.params.id,
        },
    })
    .then((calendar) => {
        res.status(200).json({
            message: "Calendar refused",
            calendar: calendar,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;
