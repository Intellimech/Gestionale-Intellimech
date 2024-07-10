import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import reportingread from './reportingread.js';
import reportingcreate from './reportingcreate.js';

router.use('/reporting', reportingread);
router.use('/reporting', reportingcreate);

export default router;