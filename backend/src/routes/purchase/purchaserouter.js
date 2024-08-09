import express from 'express';

// Setup the express router
const router = express.Router();

// Importa le rotte
import purchaseCreate from './purchasecreate.js';
import purchaseRead from './purchaseread.js';
import purchaseUpdate from './purchaseupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

// Usa le rotte
router.use('/purchase', purchaseCreate);
router.use('/purchase', purchaseRead);
router.use('/purchase', purchaseUpdate);
 
export default router;