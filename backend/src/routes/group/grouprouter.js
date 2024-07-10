import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import group from './groupread.js';

router.use('/group', group);

export default router;