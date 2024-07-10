import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import roleread from './roleread.js';

router.use('/role', roleread);

export default router;