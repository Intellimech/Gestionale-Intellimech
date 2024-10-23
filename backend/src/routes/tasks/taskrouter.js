import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import taskread from './taskread.js';
import reportingcreate from './reportingcreate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/task', taskread);

export default router;