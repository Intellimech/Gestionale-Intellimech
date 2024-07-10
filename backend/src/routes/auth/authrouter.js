import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import login from './login.js';
import verify from './verify.js';
import logout from './logout.js';

router.use('/auth', login);
router.use('/auth', verify);
router.use('/auth', logout);


export default router;