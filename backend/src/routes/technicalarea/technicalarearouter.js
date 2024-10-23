import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import technicalarearead from './technicalarearead.js';
import technicalareacreate from './technicalareacreate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/technicalarea', technicalarearead);
router.use('/technicalarea', technicalareacreate);

export default router;