import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import locationsread from './locationsread.js';
import locationupdate from './locationupdate.js';
import locationcreate from './locationscreate.js'

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/locations', locationsread);
router.use('/locations', locationupdate);
router.use('/locations', locationcreate);



export default router;