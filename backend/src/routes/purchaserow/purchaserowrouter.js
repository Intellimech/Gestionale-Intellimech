import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import purchaserowread from './purchaserowread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/purchaserow', purchaserowread);

export default router;