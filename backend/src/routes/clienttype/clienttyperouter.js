import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import clienttyperead from './clienttyperead.js';
import clienttypecreate from './clienttypecreate.js';
import clienttypeupdate from './clienttypeupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/clienttype', clienttyperead);
router.use('/clienttype', clienttypeupdate);
router.use('/clienttype', clienttypecreate);

export default router;