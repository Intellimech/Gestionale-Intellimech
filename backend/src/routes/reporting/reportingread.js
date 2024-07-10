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
import { Op } from "sequelize";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    const { filterDate } = req.body;

    // Get the current date
    const currentDate = new Date().toISOString().slice(0, 10);

    Reporting.findAll({
        where: {      
            createdAt: {
            [Op.eq]: filterDate || currentDate
          } },
        include: [
            {
                model: sequelize.models.Job,
                attributes: ["id_job", "name"]
            },
            {
                model: sequelize.models.Tasks,
                attributes: ["id_task", "name", "description"]
            },
            { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }  
        ]
    })
    .then((reporting) => {

    // check if the hours sum is greater than 8
    let sum = 0;
    let status = "";
    reporting.forEach((report) => {
        sum += parseInt(report.hours);
    });
    if (sum = 8) {
        status = "Completed";
    }

    if (sum > 8) {
        status = "Overworked";
    }

    if (sum < 8) {
        status = "Underworked";
    }

    res.status(200).json({
        message: "Reporting found",
        reporting: reporting,
        status: status
    });
})
});

export default router;