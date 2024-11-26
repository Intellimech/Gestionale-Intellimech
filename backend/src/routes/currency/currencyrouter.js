import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import currencyread from './currencyread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/currency', currencyread);

export default router;