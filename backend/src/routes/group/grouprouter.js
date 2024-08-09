import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import group from './groupread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/group', group);

export default router;