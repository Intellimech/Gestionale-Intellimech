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

const __dirname = path.resolve();
const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

// __dirname
router.get("/read/", (req, res) => {
    // Get the role from the database
    const Job = sequelize.models.Job;
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, publickey, async (err, decoded) => {
        Job.findAll({
            include: [
                {
                    model: sequelize.models.SalesOrder,
                    attributes: ["id_salesorder", "name"],
                    include: [
                        {
                            model: sequelize.models.Offer,
                            attributes: ["id_offer", "name", "hour", "amount","estimatedstart","estimatedend"],
                            include: [
                                {
                                    model: sequelize.models.QuotationRequest,
                                    attributes: ["id_quotationrequest", "name"],
                                    include: [
                                        {
                                            model: sequelize.models.Company,
                                            attributes: ["id_company", "name"],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    
                },
                {
                    model: sequelize.models.Reporting,
                },
                {
                    model: sequelize.models.User,
                    as: "createdByUser",
                    attributes: ["id_user", "name", "surname"],
                }
            ],
        })
        .then((jobs) => {
            if (jobs) {
                res.status(200).json({
                    message: "Job found",
                    jobs: jobs,
                });
            } else {
                res.status(400).json({
                    message: "Job do not exist",
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
            });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            message: "Unauthorized",
        });
    });
});

export default router;