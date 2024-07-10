import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import invoiceread from './invoiceread.js';
import invoicestats from './invoicestats.js';

router.use('/invoice', invoiceread);
router.use('/invoice', invoicestats);

export default router;