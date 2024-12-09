import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import eventread from './eventread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/event', eventread);

export default router;