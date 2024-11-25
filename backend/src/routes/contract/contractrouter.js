import express from 'express';

// Setup the express router
const router = express.Router();

// Importa le rotte
import contractRead from './contractread.js';
import contractCreate from './contractcreate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

// Usa le rotte
router.use('/contract', contractRead);
router.use('/contract', contractCreate);
 
export default router;