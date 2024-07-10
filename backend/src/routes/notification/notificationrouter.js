import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import notificationread from './notificationread.js';

router.use('/notification', notificationread);

export default router;