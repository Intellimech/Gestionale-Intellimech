import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import permissionread from './permissionread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/permission', permissionread);

export default router;