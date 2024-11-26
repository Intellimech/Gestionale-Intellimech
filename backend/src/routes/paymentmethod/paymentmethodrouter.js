import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import paymentmethodread from './paymentmethodread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/paymentmethod', paymentmethodread);

export default router;