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
import Reporting from "../../models/reporting.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.post("/create/", (req, res) => {
    const { hours, date, job, task } = req.body;
    const Reporting = sequelize.models.Reporting;

    const dateformatted = new Date(date);

    Reporting.create({
        hour: hours,
        date: dateformatted,
        job: job,
        task: task
    })
    .then((reporting) => {
        res.status(200).json({
            message: "Reporting created",
            reporting: reporting
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: "Reporting not created",
            error: error
        });
    });
});

export default router;