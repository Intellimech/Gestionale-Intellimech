import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import companyread from './companyread.js';
import companycreate from './companycreate.js';
import companyupdate from './companyupdate.js';
import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/company', companyread);
router.use('/company', companyupdate);
router.use('/company', companycreate);
export default router;