import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import categoryread from './categoryread.js';
import categorycreate from './categorycreate.js';
import categoryupdate from './categoryupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/category', categoryupdate);
router.use('/category', categoryread);
router.use('/category', categorycreate);


export default router;