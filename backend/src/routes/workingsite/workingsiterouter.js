import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import workingsiteread from './workingsiteread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/workingsite', workingsiteread);

export default router;