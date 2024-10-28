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

router.post("/generalcreate/", async (req, res) => {
   
    const user = req.user;  // Assuming req.user is populated by the authentication middleware
    const { startDate, endDate, part, location, status, owner } = req.body; // part è ora una stringa singola

  
 
        try {
            // Get the Calendar model
            const Calendar = sequelize.models.Calendar;

            // Create calendar entries
            const calendarEntries = [];

            if (startDate) {
                const start = new Date(startDate);
                const end = endDate ? new Date(endDate) : start;
                
                // Check if startDate and endDate are the same or if endDate is undefined
                if (start.getTime() === end.getTime()) {
                    //Get the location object
                    const Location = sequelize.models.Location;
                    const locationObj = await Location.findOne({
                        where: {
                            id_location: location,
                        },
                    });
                    
                    // Insert once for that day and the specific part
                    const entry = await Calendar.create({
                        date: start.toISOString().split('T')[0],
                        period: part,
                        location: location,
                        status: status,
                        owner: owner,
                        createdBy:user.id_user,
                    });
                    calendarEntries.push(entry);
                } else {
                    // If there is an interval, insert for each day in the range
                    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
                        const entry = await Calendar.create({
                            date: currentDate.toISOString().split('T')[0],
                            period: part,  // single 'part' per request
                            location: location,
                            status: location == '1' || location == '2' ? "In Attesa di Approvazione" : "Approvata",
                            owner: user.id_user,
                            createdBy:user.id_user,
                        });
                        calendarEntries.push(entry);
                    }
                }
            }

            res.json({
                message: "Calendar entries created",
                calendars: calendarEntries,
            });
        } catch (dbError) {
            Logger("error","Database error:", dbError);
            res.status(500).json({ message: "Internal server error" });
        }
        
  
});
router.post("/create/", async (req, res) => {
   
        const user = req.user;  // Assuming req.user is populated by the authentication middleware
        const { startDate, endDate, part, location, status } = req.body; // part è ora una stringa singola

      
     
            try {
                // Get the Calendar model
                const Calendar = sequelize.models.Calendar;

                // Create calendar entries
                const calendarEntries = [];

                if (startDate) {
                    const start = new Date(startDate);
                    const end = endDate ? new Date(endDate) : start;
                    
                    // Check if startDate and endDate are the same or if endDate is undefined
                    if (start.getTime() === end.getTime()) {
                        //Get the location object
                        const Location = sequelize.models.Location;
                        const locationObj = await Location.findOne({
                            where: {
                                id_location: location,
                            },
                        });
                        
                        // Insert once for that day and the specific part
                        const entry = await Calendar.create({
                            date: start.toISOString().split('T')[0],
                            period: part,
                            location: location,
                            status: locationObj.needApproval ? "In Attesa di Approvazione" : "Approvata",
                            owner: user.id_user,
                            createdBy:user.id_user,
                        });
                        calendarEntries.push(entry);
                    } else {
                        // If there is an interval, insert for each day in the range
                        for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
                            const entry = await Calendar.create({
                                date: currentDate.toISOString().split('T')[0],
                                period: part,  // single 'part' per request
                                location: location,
                                status: location == '1' || location == '2' ? "In Attesa di Approvazione" : "Approvata",
                                owner: user.id_user,
                                createdBy:user.id_user,
                            });
                            calendarEntries.push(entry);
                        }
                    }
                }

                res.json({
                    message: "Calendar entries created",
                    calendars: calendarEntries,
                });
            } catch (dbError) {
                Logger("error","Database error:", dbError);
                res.status(500).json({ message: "Internal server error" });
            }
            
      
});

export default router;
