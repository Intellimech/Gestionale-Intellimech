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
    // Get the role from the database
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const SalesOrder = sequelize.models.SalesOrder;

    SalesOrder.findAll({
        include: [
            {
                model: sequelize.models.Offer,
                include: [
                    {
                        model: sequelize.models.QuotationRequest,
                        include: [
                          { model: sequelize.models.Company, attributes: ["id_company", "name"] },
                          { model: sequelize.models.Category, attributes: ["id_category", "name"] },
                          { model: sequelize.models.Subcategory, attributes: ["id_subcategory", "name"] },
                          { model: sequelize.models.Assignment, attributes: ["id_assignment", "code", "description"] },
                          { model: sequelize.models.ProjectType, attributes: ["id_projecttype", "code", "description"] },
                          { model: sequelize.models.TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
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

// New route to get a specific sales order by ID
router.get("/read/:id", (req, res) => {
    const { id } = req.params;  // Extracting ID from the route parameters

    const SalesOrder = sequelize.models.SalesOrder;

    SalesOrder.findOne({
        where: { id_salesorder: id },  // Searching for the sales order by ID
        attributes: ["id_salesorder", "name", "status"],
        include: [
            {
                model: sequelize.models.Offer,
                include: [
                    {
                        model: sequelize.models.QuotationRequest,
                        include: [
                          { model: sequelize.models.Company, attributes: ["id_company", "name"] },
                          { model: sequelize.models.Category, attributes: ["id_category", "name"] },
                          { model: sequelize.models.Subcategory, attributes: ["id_subcategory", "name"] },
                          { model: sequelize.models.Assignment, attributes: ["id_assignment", "code", "description"] },
                          { model: sequelize.models.ProjectType, attributes: ["id_projecttype", "code", "description"] },
                          { model: sequelize.models.TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
                        ],
                    },
                ],
            },
            { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
            { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }
        ],
    })
        .then((salesorder) => {
            if (!salesorder) {
                return res.status(404).json({ message: "Sales order not found" });
            }
            res.status(200).json({
                salesorder: salesorder,
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