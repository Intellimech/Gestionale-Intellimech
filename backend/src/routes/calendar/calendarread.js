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

router.get("/read/", async (req, res) => {
    try {
        // Get the token from the header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify the token
        jwt.verify(token, publicKey, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            try {
                // Get the Calendar model
                const Calendar = sequelize.models.Calendar;

                // Get all the calendars where the owner is the user
                const calendars = await Calendar.findAll({
                    where: {
                        owner: decoded.id,
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
                Logger.error("Database error:", dbError);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    } catch (error) {
        Logger.error("Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
