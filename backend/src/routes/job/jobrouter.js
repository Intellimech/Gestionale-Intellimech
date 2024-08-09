import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import jobread from './jobread.js';
import jobcreate from './jobcreate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/job', jobread);
router.use('/job', jobcreate);

export default router;