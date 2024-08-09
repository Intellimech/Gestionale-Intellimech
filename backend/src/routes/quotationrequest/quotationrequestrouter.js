import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import quotationrequestread from './quotationrequestread.js';
import quotationrequestcreate from './quotationrequestcreate.js';
import quotationrequestaccept from './quotationrequestaccept.js';
import quotationrequestrefused from './quotationrequestrefused.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/quotationrequest', quotationrequestread);
router.use('/quotationrequest', quotationrequestcreate);
router.use('/quotationrequest', quotationrequestaccept);
router.use('/quotationrequest', quotationrequestrefused);

export default router;