import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import subgroupread from './subgroupread.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/subgroup', subgroupread);

export default router;