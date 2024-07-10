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

// Import models
const QuotationRequest = sequelize.models.QuotationRequest;
const Company = sequelize.models.Company;
const Category = sequelize.models.Category;
const Subcategory = sequelize.models.Subcategory;
const TechnicalArea = sequelize.models.TechnicalArea;
const User = sequelize.models.User;
const Offer = sequelize.models.Offer;

// Setup the express router
const router = express.Router();

// Middleware
router.use(bodyParser.json());
router.use(cors());

// Routes
router.get("/read/free", async (req, res) => {
    try {
        // Fetch all quotation requests joined with company, category, subcategory, technical area, and user
        let quotationrequest = await QuotationRequest.findAll({
            include: [
                { model: Company, attributes: ["id_company", "name"] },
                { model: Category, attributes: ["id_category", "name"] },
                { model: Subcategory, attributes: ["id_subcategory", "name"] },
                { model: TechnicalArea, attributes: ["id_technicalarea", "name"] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }    
            ],
        });

        // Filter out quotation requests with accepted offers
        for (let i = 0; i < quotationrequest.length; i++) {
            const quotation = quotationrequest[i];

            // Check if there is an offer for the quotation request
            const offer = await Offer.findOne({
                where: {
                    quotationrequest: quotation.id_quotationrequest,
                },
            });

            // If there is an offer and the status is nuova or inviata al cliente or accettata, remove the quotation request from the list
            if (offer && (offer.status === "Nuova" || offer.status === "Inviata al cliente" || offer.status === "Accettata")) {
                quotationrequest = quotationrequest.filter((qr) => qr.id_quotationrequest !== quotation.id_quotationrequest);
            }

            const creationDate = new Date(quotation.createdAt); // Assuming quotation.createdAt is a valid date string or a Date object
            const deadlineDate = new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days to the creation date
            const currentDate = new Date(); // Get current date

            // Save the changes (assuming you meant to update the quotation here)
            await quotation.save();

            // Create a new field in the object if needed
            // quotation.someNewField = someValue;
        }

        res.status(200).json({
            message: "Quotation Requests found",
            quotationrequest: quotationrequest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/read/", async (req, res) => {
    try {
        // Fetch all quotation requests joined with company, category, subcategory, technical area, and user
        const quotationrequest = await QuotationRequest.findAll({
            include: [
                { model: Company, attributes: ["id_company", "name"] },
                { model: Category, attributes: ["id_category", "name"] },
                { model: Subcategory, attributes: ["id_subcategory", "name"] },
                { model: TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }    
            ],
        });

        res.status(200).json({
            message: "Quotation Requests found",
            quotationrequest: quotationrequest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
