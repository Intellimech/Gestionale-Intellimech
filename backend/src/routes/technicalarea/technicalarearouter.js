import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import technicalarearead from './technicalarearead.js';
import technicalareacreate from './technicalareacreate.js';


router.use('/technicalarea', technicalarearead);
router.use('/technicalarea', technicalareacreate);


export default router;