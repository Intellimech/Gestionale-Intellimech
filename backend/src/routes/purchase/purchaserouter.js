import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import purchaseread from './purchaseread.js';
import purchasecreate from './purchasecreate.js';
import purchaseaccept from './purchaseaccept.js';
import purchaserefused from './purchaserefused.js';
import purchasesent from './purchasesent.js';


router.use('/purchase', purchaseread);
router.use('/purchase', purchasecreate);


export default router;