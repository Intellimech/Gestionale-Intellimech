import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import calendarread from './calendarread.js';
import calendarcreate from './calendarcreate.js';
import calendarupdate from './calendarupdate.js';
import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/calendar', calendarread);
router.use('/calendar', calendarcreate);
router.use('/calendar', calendarupdate);

export default router;