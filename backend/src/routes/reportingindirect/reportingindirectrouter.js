import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import reportingindirectread from './reportingindirectread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/reportingindirect', reportingindirectread);

export default router;