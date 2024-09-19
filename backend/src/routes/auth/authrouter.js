import express from 'express';

// Setup the express router
const router = express.Router();

// Routes
import login from './login.js';
import verify from './verify.js';
import logout from './logout.js';
import changepass from './changepass.js';
import forgotpassword from './forgotpassword.js';

router.use('/auth', login);
router.use('/auth', verify);
router.use('/auth', logout);
router.use('/auth', changepass);
router.use('/auth', forgotpassword);


export default router;