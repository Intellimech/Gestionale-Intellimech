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

router.get("/read/:job", (req, res) => {
    const { job } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    if (!job) {
        return res.status(400).json({
            message: "Bad request, view documentation for more information",r
        });
    }

    jwt.verify(token, publickey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const User = sequelize.models.User;
        const Tasks = sequelize.models.Tasks;
        const Reporting = sequelize.models.Reporting;

        Tasks.findAll({
            where: {
                assignedTo: decoded.id,
                job: job
            },
            include: [
                {
                    model: Reporting,
                    required: false
                }
            ]
        })
        .then((tasks) => {
            //Add the percentage of the task calculated by the reported hours
            tasks.forEach((task) => {
                let totalHours = 0;
                task.Reportings.forEach((reporting) => {
                    totalHours += reporting.hour * 1;
                });

                task.dataValues.percentage = ((totalHours / (task.hour * 1)) * 100).toFixed(0);

                //remove the object for the response if the totalHours is equal to the task.hour
                if (totalHours == task.hour) {
                    task.dataValues.percentage = 100;
                    delete task.dataValues.Reportings;
                }

                if (task.dataValues.percentage > 100) {
                    task.dataValues.percentage = 100;
                }
            });

            res.status(200).json({
                message: "Tasks found",
                tasks: tasks
            });
        })
    });
});

export default router;