import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import projecttyperead from './projecttyperead.js';
import projecttypecreate from './projecttypecreate.js';
import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/projecttype', projecttyperead);
router.use('/projecttype', projecttypecreate);

export default router;