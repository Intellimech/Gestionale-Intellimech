import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";  // Import Op here
import { Op } from "sequelize";
import Logger from "../../utils/logger.js";

// Initialize environment variables
dotenv.config();

// Setup the express router
const router = express.Router();

// Define the directory name
const __dirname = path.resolve();

// Read the public key for JWT verification
const publicKeyPath = path.join(__dirname, "src/keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// Updated read route to get calendars where location is "Ferie" or "Permessi" for the logged-in user
router.get("/read", async (req, res) => {
 
    const user = req.user;  // Assuming req.user is populated by the authentication middleware


    try {
        // Get the Calendar model
        const Calendar = sequelize.models.Calendar;

        // Get all the calendars where the location is "Ferie" or "Permessi"
        const calendars = await Calendar.findAll({
            include: [
                {
                    model: sequelize.models.User,
                    as: "ownerUser",
                    attributes: ["id_user", "name", "surname"],
                },
                {
                    model: sequelize.models.Location,
                    attributes: ["id_location", "name", "needApproval"],
                }
            ],
            where: {
                
                status :"In Attesa di Approvazione"
            },
        });                

        // Change the format of the date to "2024-06-27"
        const formattedCalendars = calendars.map(calendar => ({
            ...calendar.toJSON(),
            date: calendar.date.toISOString().split("T")[0],
        }));

        res.json({
            message: "Calendars found",
            calendars: formattedCalendars,
        });
    } catch (dbError) {
        Logger('error', "Database error:" + dbError);
        res.status(500).json({ message: "Internal server error" });
    }
   
});

export default router;