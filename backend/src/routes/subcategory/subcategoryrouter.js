import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import subcategoryread from './subcategoryread.js';
import subcategorycreate from './subcategorycreate.js';


router.use('/subcategory', subcategoryread);
router.use('/subcategory', subcategorycreate);


export default router;