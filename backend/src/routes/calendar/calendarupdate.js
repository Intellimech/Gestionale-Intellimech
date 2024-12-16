import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import sequelize from '../../utils/db.js';
import Logger from '../../utils/logger.js';
import { Op } from 'sequelize';
import Location from '../../models/locations.js';

// Initialize environment variables
dotenv.config();

// Setup the express router
const router = express.Router();

// Define the directory name
const __dirname = path.resolve();

// Read the public key for JWT verification
const publicKeyPath = path.join(__dirname, 'src/keys/public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

router.post('/update/', async (req, res) => {
    const user = req.user;  
    const { morning_id, afternoon_id, afternoon_status, date, morning_location_id, afternoon_location_id, morning_status } = req.body;

    console.log('Dati ricevuti:', { morning_id, afternoon_id, afternoon_status, date, morning_location_id, afternoon_location_id, morning_status});

    try {
        const Calendar = sequelize.models.Calendar;

        // Handle morning entry
        if (morning_id) {
            const morningEntry = await Calendar.findOne({
                where: {
                    id_calendar: morning_id,
                }
            });
        
            if (!morningEntry) {
                console.error('Voce del calendario mattutina non trovata');
                return res.status(404).json({ message: 'Morning calendar entry not found' });
            }

            // Check if the location is the same
            if (morningEntry.location !== morning_location_id) {
                const locationObj = await Location.findOne({
                    where: {
                        id_location: morning_location_id,
                    }
                });

                if (!locationObj) {
                    console.error('Location non trovata');
                    return res.status(404).json({ message: 'Location not found' });
                }
            
                await morningEntry.update({
                    location: morning_location_id,
                    status: morning_status,
                    updatedBy: user.id_user
                });
            }
        } else if (!morning_location_id) {
            // Create morning entry if morning_id is null
            await Calendar.create({
                date,
                location: morning_location_id,
                status: morning_status,
                period: "morning",
                owner: user.id_user,
                createdBy: user.id-user
            });
        }

        // Handle afternoon entry
        if (afternoon_id) {
            const afternoonEntry = await Calendar.findOne({
                where: {
                    id_calendar: afternoon_id,
                }
            });
        
            if (!afternoonEntry) {
                console.error('Voce del calendario pomeridiana non trovata');
                return res.status(404).json({ message: 'Afternoon calendar entry not found' });
            }

            if (afternoonEntry.location !== afternoon_location_id) {
                const locationObj = await Location.findOne({
                    where: {
                        id_location: afternoon_location_id,
                    }
                });

                if (!locationObj) {
                    console.error('Location non trovata');
                    return res.status(404).json({ message: 'Location not found' });
                }
            
                await afternoonEntry.update({
                    location: afternoon_location_id,
                    status: afternoon_status,
                    owner: user.id_user,
                    createdBy: user.id_user,
                });
            }
        } else if (!afternoon_id && afternoon_location_id) {
            // Create afternoon entry if afternoon_id is null
            await Calendar.create({
                date,
                location: afternoon_location_id,
                period: "afternoon",
                status: afternoon_status,
                owner: user.id_user
            });
        }

        res.json({
            message: 'Voce del calendario aggiornata con successo',
        });
    } catch (dbError) {
        Logger("error",'Database error:', dbError);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
