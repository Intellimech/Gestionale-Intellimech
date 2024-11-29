import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import roleread from './roleread.js';
import rolecreate from './rolecreate.js'
import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/role', roleread);
router.use('/role', rolecreate);

export default router;