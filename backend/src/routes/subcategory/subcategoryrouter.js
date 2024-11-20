import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import subcategoryread from './subcategoryread.js';
import subcategorycreate from './subcategorycreate.js';
import subcategoryupdate from './subcategoryupdate.js';

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

router.use('/subcategory', subcategoryread);
router.use('/subcategory', subcategorycreate);
router.use('/subcategory', subcategoryupdate)

export default router;