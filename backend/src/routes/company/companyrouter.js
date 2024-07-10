import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import companyread from './companyread.js';;


router.use('/company', companyread);


export default router;