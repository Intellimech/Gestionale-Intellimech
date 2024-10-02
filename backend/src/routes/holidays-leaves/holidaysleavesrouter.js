import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import holidaysleavesread from './holidaysleavesread.js';
import holidaysleavesapprove from './holidaysleavesapprove.js';
import holidaysleavesreject from './holidaysleavesreject.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/holidays-leaves', holidaysleavesread);
router.use('/holidays-leaves', holidaysleavesapprove);
router.use('/holidays-leaves', holidaysleavesreject);

export default router;