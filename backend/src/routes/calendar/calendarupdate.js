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
        const { morning_id, afternoon_id, afternoon_status, date, morning_location_id, afternoon_location_id , morning_status } = req.body;

        console.log('Dati ricevuti:', { morning_id, afternoon_id, afternoon_status, date, morning_location_id, afternoon_location_id , morning_status});
        

            try {
                const Calendar = sequelize.models.Calendar;

                if (morning_id && morning_location_id) {
                    const morningEntry = await Calendar.findOne({
                        where: {
                            id_calendar: morning_id,
                        }
                    });
                    console.log('Voce mattutina:', morningEntry);
                
                    if (!morningEntry) {
                        console.error('Voce del calendario mattutina non trovata');
                        return res.status(404).json({ message: 'Morning calendar entry not found' });
                    }
                
                    console.log('Aggiornamento location mattutina:', morning_location_id);
                    await morningEntry.update({
                        location: morning_location_id,
                        status: morning_status,
                        updatedBy: user.id_user
                    });
                    console.log('Location mattutina aggiornata con successo');
                }
                
                if (afternoon_id && afternoon_location_id) {
                    const afternoonEntry = await Calendar.findOne({
                        where: {
                            id_calendar: afternoon_id,
                        }
                    });
                    console.log('Voce pomeridiana:', afternoonEntry);
                
                    if (!afternoonEntry) {
                        console.error('Voce del calendario pomeridiana non trovata');
                        return res.status(404).json({ message: 'Afternoon calendar entry not found' });
                    }
                
                    console.log('Aggiornamento location pomeridiana:', afternoon_location_id);
                    await afternoonEntry.update({
                        location: afternoon_location_id,
                        status: afternoon_status,
                        updatedBy: user.id_user
                    });
                    console.log('Location pomeridiana aggiornata con successo');
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
