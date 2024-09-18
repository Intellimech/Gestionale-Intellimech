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
        const { id_calendar, date, period, location } = req.body;

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

                // Update or create the calendar entry
                await Calendar.upsert({
                    id_calendar: id_calendar,
                    date: date,
                    period: period,
                    location: location,
                    owner: decoded.id, // User ID from the token
                    updatedBy: decoded.id // User ID from the token
                });

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
