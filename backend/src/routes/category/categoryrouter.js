import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import categoryread from './categoryread.js';
import categorycreate from './categorycreate.js';


router.use('/category', categoryread);
router.use('/category', categorycreate);


export default router;