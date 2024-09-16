import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
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
// Update calendar entry
// Update or create calendar entry
router.post("/update/", async (req, res) => {
    try {
        // Get the token from the header
        const token = req.headers.authorization?.split(" ")[1];
        const { date, period, location } = req.body;
        console.log("body: "+ req.body);

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

                // Prepare entries array to store the updates or new entries
                const updates = [];
                console.log("body: "+ req.body);

                // Update or create the afternoon entry if provided
               
                    updates.push(Calendar.upsert({
                        date: date,
                        period: period,
                        location: location,
                        owner: decoded.id,
                        updatedBy: decoded.id
                    }));
                

                // Wait for all updates to complete
                await Promise.all(updates);

                res.json({
                    message: "Calendar entries updated successfully",
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