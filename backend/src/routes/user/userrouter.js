import express from 'express';
import jwt from 'jsonwebtoken';
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

router.use('/user', usercreate);
router.use('/user', userdelete);
router.use('/user', userupdate);
router.use('/user', userread);
router.use('/user', userconfig);
router.use('/user', useraccess);
router.use('/user', forceaction);

export default router;