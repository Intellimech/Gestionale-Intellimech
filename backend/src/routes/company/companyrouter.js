import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import companyread from './companyread.js';;

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/company', companyread);

export default router;