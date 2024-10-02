import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import locationsread from './locationsread.js';
import locationupdate from './locationupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/locations', locationsread);
router.use('/locations', locationupdate);



export default router;