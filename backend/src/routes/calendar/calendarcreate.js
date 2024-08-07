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

router.post("/create/", async (req, res) => {
    try {
        // Get the token from the header
        const token = req.headers.authorization?.split(" ")[1];
        const { date, part, location } = req.body;
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

                // Create a new calendar
                const newCalendar = await Calendar.create({
                    date: date,
                    period: part,
                    location: location,
                    owner: decoded.id,
                    createdBy: decoded.id,
                });

                res.json({
                    message: "Calendars created",
                    calendar: newCalendar,
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
