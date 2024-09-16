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
        const { startDate, endDate, parts, location } = req.body; // parts è ora un array

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

                // Create calendar entries for each selected part of the day
                const calendarEntries = [];

                if (startDate) {
                    const start = new Date(startDate);
                    const end = endDate ? new Date(endDate) : start;

                    // Check if startDate and endDate are the same or if endDate is undefined
                    if (start.getTime() === end.getTime()) {
                        // If it's the same day, just insert once for that day
                        const entries = await Promise.all(
                            parts.map(async (part) => {
                                return Calendar.create({
                                    date: start.toISOString().split('T')[0],
                                    period: part, // part è ora un valore singolo
                                    location: location,
                                    owner: decoded.id,
                                    createdBy: decoded.id,
                                });
                            })
                        );
                        calendarEntries.push(...entries);
                    } else {
                        // If there is an interval, insert for each day in the range
                        for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
                            const entries = await Promise.all(
                                parts.map(async (part) => {
                                    return Calendar.create({
                                        date: currentDate.toISOString().split('T')[0],
                                        period: part,
                                        location: location,
                                        owner: decoded.id,
                                        createdBy: decoded.id,
                                    });
                                })
                            );
                            calendarEntries.push(...entries);
                        }
                    }
                }

                res.json({
                    message: "Calendars created",
                    calendars: calendarEntries,
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
