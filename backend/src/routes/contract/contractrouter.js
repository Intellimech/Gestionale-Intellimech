import express from 'express';

// Setup the express router
const router = express.Router();
import contractRead from './contractread.js';
import contractCreate from './contractcreate.js';
import contractUpdate from './contractupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/contract', contractRead);
router.use('/contract', contractCreate);
router.use('/contract', contractUpdate);
 
export default router;