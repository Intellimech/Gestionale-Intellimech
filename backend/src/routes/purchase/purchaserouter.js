import express from 'express';
 
// Importa le rotte
import purchaseCreate from './purchasecreate.js';
import purchaseRead from './purchaseread.js';
import productCreate from './productcreate.js';
import productRead from './productread.js';
 
// Setup the express router
const router = express.Router();
 
// Usa le rotte
router.use('/purchase', purchaseCreate);
router.use('/purchase', purchaseRead);
router.use('/product', productCreate);
router.use('/product', productRead);
 
export default router;