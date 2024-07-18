import express from 'express';
 
// Importa le rotte
import purchaseCreate from './purchasecreate.js';
import purchaseRead from './purchaseread.js';
 
// Setup the express router
const router = express.Router();
 
// Usa le rotte
router.use('/purchase', purchaseCreate);
router.use('/purchase', purchaseRead);
 
export default router;