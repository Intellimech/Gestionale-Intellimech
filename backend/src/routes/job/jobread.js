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

const __dirname = path.resolve();
const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");
// Assuming req.user is populated by the authentication middleware
// __dirname

router.get("/read/", (req, res) => {
    const Job = sequelize.models.Job;

    Job.findAll({
        include: [
            {
                model: sequelize.models.SalesOrder,
                attributes: ["id_salesorder", "name"],
                include: [
                    {
                        model: sequelize.models.Offer,
                        attributes: ["id_offer", "name", "hour", "amount", "estimatedstart", "estimatedend"],
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
                            {
                                model: sequelize.models.Tasks,
                                attributes: ["id_task", "name", "description", "percentage"],
                                include: [
                                    {
                                        model: sequelize.models.Reporting,
                                        as: "taskReportings",
                                    },
                                    {
                                        model: sequelize.models.Tasks,
                                        attributes: ["id_task", "name", "description", "percentage"],
                                        include: [
                                            {
                                                model: sequelize.models.Reporting,
                                                as: "taskReportings",
                                                include: [
                                                    {
                                                        model: sequelize.models.Event,
                                                        as: 'associatedEvent',
                                                        attributes: ['id_event', 'name'],
                                                    },
                                                    {
                                                        model: sequelize.models.Certification,
                                                        as: 'associatedCertification',
                                                        attributes: ['id_certification', 'name'],
                                                    },
                                                    {
                                                        model: sequelize.models.Company,
                                                        as: 'associatedCompany',
                                                        attributes: ['id_company', 'name'],
                                                    }
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                model: sequelize.models.User,
                as: "createdByUser",
                attributes: ["id_user", "name", "surname"],
            },
        ],
    })
    .then((jobs) => {
        if (jobs) {
            // Aggiungi il campo totalHours e totalPercentage per ogni job
            const jobsWithStats = jobs.map((job) => {
                let jobTotalHours = 0;
                let totalPercentage = 0;
                let taskCount = 0;

                job.SalesOrders?.forEach((salesOrder) => {
                    const offer = salesOrder.Offer;
                    if (offer?.Tasks) {
                        offer.Tasks.forEach((task) => {
                            // Somma ore dai reporting diretti del task
                            task.taskReportings?.forEach((reporting) => {
                                jobTotalHours += reporting.hour || 0;
                            });

                            // Aggiungi la percentuale del task principale
                            if (task.percentage !== undefined) {
                                totalPercentage += task.percentage;
                                taskCount++;
                            }

                            // Somma ore e percentuali dai subtasks
                            task.Tasks?.forEach((subTask) => {
                                subTask.taskReportings?.forEach((reporting) => {
                                    jobTotalHours += reporting.hour || 0;
                                });

                                if (subTask.percentage !== undefined) {
                                    totalPercentage += subTask.percentage;
                                    taskCount++;
                                }
                            });
                        });
                    }
                });

                // Calcolo media percentuale
                const averagePercentage = taskCount > 0 ? totalPercentage / taskCount : 0;

                // Crea una lista generale delle rendicontazioni
                const allReportings = job.SalesOrders.flatMap((salesOrder) =>
                    salesOrder.Offer ? salesOrder.Offer.Tasks.flatMap((task) => task.taskReportings) : []
                );

                // Aggiungi i campi totalHours e totalPercentage al job corrente
                return {
                    ...job.toJSON(), // Converte il job in un oggetto JSON serializzabile
                    allReportings: allReportings,
                    totalHours: jobTotalHours,
                    totalPercentage: averagePercentage,
                };
            });

            res.status(200).json({
                message: "Job found",
                jobs: jobsWithStats,
            });
        } else {
            res.status(400).json({
                message: "Job does not exist",
            });
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;