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

router.get("/read/", async (req, res) => {
    try {
        // Get the role from the database
        const Offer = sequelize.models.Offer;

        const offers = await Offer.findAll({
            include: [
                {
                    model: sequelize.models.QuotationRequest,
                    attributes: ["id_quotationrequest", "name", "description"],
                    include: [
                        {
                            model: sequelize.models.Company,
                            attributes: ["id_company", "name"],
                        },
                        {
                            model: sequelize.models.Category,
                            attributes: ["id_category", "name"],
                        },
                        {
                            model: sequelize.models.Subcategory,
                            attributes: ["id_subcategory", "name"],
                        },
                        {
                            model: sequelize.models.TechnicalArea,
                            attributes: ["id_technicalarea", "name", "code"],
                        },
                    ],
                },
                { model: sequelize.models.User,  as:'team', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }    
            ],
        });

        for (let offer of offers) {
            const creationDate = new Date(offer.updatedAt); // Assum+ing offer.createdAt is a valid date string or a Date object
            const deadlineDate = new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days to the creation date
            const currentDate = new Date(); // Get current date

            // Calculate remaining days
            const timeDifference = deadlineDate.getTime() - currentDate.getTime();
            const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

            // if remaining days is less than 0, set status to "Scaduta"
            if (remainingDays < 0) {
                offer.status = "Scaduta";
            }            

            // Save the changes
            await offer.save();

            // Create a new field in the object
            offer.dataValues.deadlineDate = deadlineDate;
        }

        res.status(200).json({ 
            message: "Offers found",
            offer: offers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Offers not found",
            error: error
        });
    }
});

export default router;
