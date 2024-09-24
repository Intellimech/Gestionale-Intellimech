import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import sequelize from '../../utils/db.js';
import Logger from '../../utils/logger.js';

// Initialize environment variables
dotenv.config();

// Setup the express router
const router = express.Router();

// Define the directory name
const __dirname = path.resolve();

// Read the public key for JWT verification
const publicKeyPath = path.join(__dirname, 'src/keys/public.key');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

// Update or create calendar entry
router.post('/update/', async (req, res) => {
    try {
        // Get the token from the header
        const token = req.headers.authorization?.split(' ')[1];
        const { id_calendar, date, morning_location, afternoon_location } = req.body;

        console.log('Received data:', { id_calendar, date, morning_location, afternoon_location });

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify the token
        jwt.verify(token, publicKey, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            try {
                // Get the Calendar model
                const Calendar = sequelize.models.Calendar;

                // Update the calendar entry for the morning
                console.log('Updating morning location:', morning_location);
                await Calendar.update(
                    { location: morning_location, owner: decoded.id, updatedBy: decoded.id },
                    { where: { id_calendar: id_calendar, date: date, period: 'morning' } }
                );

                // Update the calendar entry for the afternoon
                console.log('Updating afternoon location:', afternoon_location);
                await Calendar.update(
                    { location: afternoon_location, owner: decoded.id, updatedBy: decoded.id },
                    { where: { id_calendar: id_calendar, date: date, period: 'afternoon' } }
                );

                res.json({
                    message: 'Calendar entry updated successfully',
                });
            } catch (dbError) {
                Logger.error('Database error:', dbError);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    } catch (error) {
        Logger.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
