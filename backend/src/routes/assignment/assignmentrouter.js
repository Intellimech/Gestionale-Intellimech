import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import assignmentread from './assignmentread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/assignment', assignmentread);

export default router;