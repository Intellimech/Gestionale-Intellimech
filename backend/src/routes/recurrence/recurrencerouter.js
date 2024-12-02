import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import recurrenceread from './recurrenceread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/recurrence', recurrenceread);

export default router;