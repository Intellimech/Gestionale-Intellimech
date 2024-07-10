import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import taskread from './taskread.js';
import reportingcreate from './reportingcreate.js';

router.use('/task', taskread);

export default router;