import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import mailinglistread from './mailinglistread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/mailinglist', mailinglistread);

export default router;