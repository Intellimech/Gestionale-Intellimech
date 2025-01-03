import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import contractrowread from './contractrowread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/contractrow', contractrowread);

export default router;