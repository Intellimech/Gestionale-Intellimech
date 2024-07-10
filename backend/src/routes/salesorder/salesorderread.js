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

router.get("/read/", (req, res) => {
    // Get the role from the database
    const SalesOrder = sequelize.models.SalesOrder;

    SalesOrder.findAll({
        attributes: ["id_salesorder", "name", "status"],
        include: [
            {
                model: sequelize.models.Offer,
                attributes: ["id_offer", "name", "status", "description"],
                include: [
                    {
                        model: sequelize.models.QuotationRequest,
                        attributes: ["id_quotationrequest", "name", "status", "description"],
                        include: [
                            {
                                model: sequelize.models.Company,
                                attributes: ["id_company", "name"],
                            },
                        ],
                    },
                ],
            },
            { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }
        ],
    })
        .then((salesorders) => {
            res.status(200).json({
                salesorders: salesorders,
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