import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import certificationread from './certificationread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/certification', certificationread);

export default router;