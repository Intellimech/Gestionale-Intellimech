import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import offerread from './offerread.js';
import offercreate from './offercreate.js';
import offeraccept from './offeraccept.js';
import offerrefused from './offerrefused.js';
import offersent from './offersent.js';


router.use('/offer', offerread);
router.use('/offer', offercreate);
router.use('/offer', offeraccept);
router.use('/offer', offerrefused);
router.use('/offer', offersent);


export default router;