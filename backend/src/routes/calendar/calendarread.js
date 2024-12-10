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

// Initialize environment variables
dotenv.config();

// Setup the express router
const router = express.Router();

// Define the directory name
const __dirname = path.resolve();

// Read the public key for JWT verification
const publicKeyPath = path.join(__dirname, "src/keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// Original read route to get all calendars for the logged-in user
router.get("/read", async (req, res) => {

    const user = req.user;  

    try {
        // Get the Calendar model
        const Calendar = sequelize.models.Calendar;

        // Get all the calendars where the owner is the user
        const calendars = await Calendar.findAll({
            where: {
                owner: user.id_user,
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
        Logger("error","Database error:" + dbError);
        res.status(500).json({ message: "Internal server error" });
    }
      
});

// New route to read a specific calendar entry by date and period
router.get("/read-by-date", async (req, res) => {
    
    const user = req.user;  
            const { date, period } = req.query; // Get date and period from the query params
            if (!date || !period) {
                return res.status(400).json({ message: "Date and period are required" });
            }

            try {
                // Get the Calendar model
                const Calendar = sequelize.models.Calendar;

                // Find a specific calendar entry for the user, date, and period
                const calendar = await Calendar.findOne({
                    where: {
                        owner: decoded.id,
                        date: date, // Assuming date is stored in ISO format (YYYY-MM-DD)
                        period: period, // Filter by period (e.g., "morning", "afternoon")
                    },
                });

                if (!calendar) {
                    return res.status(404).json({ message: "No calendar entry found for this date and period" });
                }

                // Format the date as "2024-06-27"
                const formattedCalendar = {
                    ...calendar.toJSON(),
                    date: calendar.date.toISOString().split("T")[0],
                };

                res.json({
                    message: "Calendar entry found",
                    calendar: formattedCalendar,
                });
            } catch (dbError) {
                Logger("error","Database error:", dbError);
                res.status(500).json({ message: "Internal server error" });
            }
        
});

router.get("/read/all", async (req, res) => {
    try {
        const Calendar = sequelize.models.Calendar;
        const calendars = await Calendar.findAll({
            include: [
                {
                    model: sequelize.models.Location,
                    attributes: ["name"],
                  },
            ]

        }

        );
        res.json(calendars);
    } catch (error) {
        Logger("error","Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
