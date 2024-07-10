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
import { create } from "domain";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.use(bodyParser.json());
router.use(cors());

router.post("/create/", async (req, res) => {
    //the job is associated with n sales orders
    const Job = sequelize.models.Job;
    const SalesOrder = sequelize.models.SalesOrder;
    const User = sequelize.models.User;
    let { SalesOrders } = req.body;

    //get the user from the token
    const __dirname = path.resolve();

    const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

    
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, publickey, async (err, decoded) => {
        if (!SalesOrders) {
            return res.status(400).json({
                message: "Bad request, view documentation for more information",
            });
        }

        try {
            const countjob = await Job.findAll({
                group: ["name"],
            });

            const jobCount = countjob.length;
            console.log("Number of offers:", jobCount);
            
            let status = "Aperta";

            const year = new Date().getFullYear().toString().substr(-2);
            const name = `COM${year}_${(jobCount + 1).toString().padStart(5, "0")}`;

            const job = await Job.create({
                name: name,
                status: status,
                createdBy: decoded.id
            });

            console.log(job);

            if (job) {
                for (const salesOrder of SalesOrders) {
                    const salesorder = await SalesOrder.findOne({
                        where: { id_salesorder: salesOrder },
                    });
                    if (salesorder) {
                        await job.addSalesOrder(salesorder);
                    } else {
                        return res.status(400).json({
                            message: "Sales order does not exist",
                        });
                    }
                }

                return res.status(200).json({
                    message: "Job created",
                    job: job,
                });
            } else {
                return res.status(400).json({
                    message: "Job does not exist",
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            message: "Unauthorized",
        });
    });
});

export default router;
