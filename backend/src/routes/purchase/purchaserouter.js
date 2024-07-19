import express from 'express';
 
// Importa le rotte
import purchaseCreate from './purchasecreate.js';
import purchaseRead from './purchaseread.js';
import purchaseUpdate from './purchaseupdate.js';

// Setup the express router
const router = express.Router();
 
// Usa le rotte
router.use('/purchase', purchaseCreate);
router.use('/purchase', purchaseRead);
router.use('/purchase', purchaseUpdate);
 
export default router;