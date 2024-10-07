import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import roleread from './contracttyperead.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/contracttype', roleread);

export default router;