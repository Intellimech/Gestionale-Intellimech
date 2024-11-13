import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import clienttyperead from './clienttyperead.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/clienttype', clienttyperead);

export default router;