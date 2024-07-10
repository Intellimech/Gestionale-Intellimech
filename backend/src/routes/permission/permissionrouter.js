import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import permissionread from './permissionread.js';

router.use('/permission', permissionread);

export default router;