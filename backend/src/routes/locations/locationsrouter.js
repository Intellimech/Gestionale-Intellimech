import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import locationread from './locationsread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/locations', locationread);


export default router;