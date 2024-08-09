import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import salesorderread from './salesorderread.js';

router.use('/salesorder', salesorderread);

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

export default router;