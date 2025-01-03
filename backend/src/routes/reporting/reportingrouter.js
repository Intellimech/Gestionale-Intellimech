import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import reportingread from './reportingread.js';
import reportingcreate from './reportingcreate.js';
import reportingdelete from './reportingdelete.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/reporting', reportingread);
router.use('/reporting', reportingcreate);
router.use('/reporting', reportingdelete);

export default router;