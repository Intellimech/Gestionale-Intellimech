import express from 'express';
import logger from '../../utils/logger.js';

// Setup the express router
const router = express.Router();

// Routes
import usercreate from './usercreate.js';
import userdelete from './userdelete.js';
import userupdate from './userupdate.js';
import userread from './userread.js';
import userconfig from './userconfig.js';
import useraccess from './useraccess.js';
import forceaction from './forceaction.js';

import Protect from '../../middleware/authmiddleware.js'; 

router.use('/user', Protect, usercreate);
router.use('/user', Protect, userdelete);
router.use('/user', Protect, userupdate);
router.use('/user', Protect, userread);
router.use('/user', Protect, userconfig);
router.use('/user', Protect, useraccess);
router.use('/user', Protect, forceaction);

export default router;