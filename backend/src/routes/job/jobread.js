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
                        attributes: ["id_offer", "name", "hour", "amount", "estimatedstart", "estimatedend", "quotationrequest"],
                        include: [
                            {
                                model: sequelize.models.QuotationRequest,
                                attributes: ["id_quotationrequest", "name", "description", "companytype"],
                                include: [
                                  { model: sequelize.models.Company, attributes: ["id_company", "name", "companytype"],
                                   
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
                                        include: [
                                            {
                                                model: sequelize.models.User,
                                                as: "createdByUser", // Include il modello User
                                                attributes: ["id_user", "name", "surname"],
                                            },
                                            {
                                                model: sequelize.models.Tasks,
                                                as: "associatedTask", // Include il modello Task
                                                attributes: ["id_task", "name", "description"],
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
                const jobsWithStats = jobs.map((job) => {
                    let jobTotalHours = 0;
                    let totalPercentage = 0;
                    let taskCount = 0;
    
                    // Estrai informazioni per `allReportings`
                    const allReportings = [];
                    job.SalesOrders?.forEach((salesOrder) => {
                        salesOrder.Offer?.Tasks?.forEach((task) => {
                            task.taskReportings?.forEach((reporting) => {
                                allReportings.push({
                                    ...reporting.toJSON(),
                                    createdByUser: reporting.createdByUser
                                        ? {
                                              id_user: reporting.createdByUser.id_user,
                                              name: reporting.createdByUser.name,
                                              surname: reporting.createdByUser.surname,
                                          }
                                        : null,
                                    associatedTask: reporting.associatedTask
                                        ? {
                                              id_task: reporting.associatedTask.id_task,
                                              name: reporting.associatedTask.name,
                                              description: reporting.associatedTask.description,
                                          }
                                        : null,
                                });
                                jobTotalHours += reporting.hour || 0;
                            });
    
                            task.Tasks?.forEach((subTask) => {
                                subTask.taskReportings?.forEach((reporting) => {
                                    allReportings.push({
                                        ...reporting.toJSON(),
                                        createdByUser: reporting.createdByUser
                                            ? {
                                                  id_user: reporting.createdByUser.id_user,
                                                  name: reporting.createdByUser.name,
                                                  surname: reporting.createdByUser.surname,
                                              }
                                            : null,
                                        associatedTask: reporting.associatedTask
                                            ? {
                                                  id_task: reporting.associatedTask.id_task,
                                                  name: reporting.associatedTask.name,
                                                  description: reporting.associatedTask.description,
                                              }
                                            : null,
                                    });
                                    jobTotalHours += reporting.hour || 0;
                                });
                            });
                        });
                    });
    
                    const averagePercentage = taskCount > 0 ? totalPercentage / taskCount : 0;
    
                    return {
                        ...job.toJSON(),
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