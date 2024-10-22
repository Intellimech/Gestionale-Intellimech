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
import offerrevision from './offerrevision.js';
import offerupdate from './offerupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/offer', offerread);
router.use('/offer', offercreate);
router.use('/offer', offeraccept);
router.use('/offer', offerrefused);
router.use('/offer', offerrevision);
router.use('/offer', offersent);
router.use('/offer', offerupdate);


export default router;