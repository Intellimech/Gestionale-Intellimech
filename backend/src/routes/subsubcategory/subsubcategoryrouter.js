import express from 'express';
import jwt from 'jsonwebtoken';

// Setup the express router
const router = express.Router();

// Routes
import subsubcategoryread from './subsubcategoryread.js';
import subsubcategorycreate from './subsubcategorycreate.js';
import subsubcategoryupdate from './subsubcategoryupdate.js';

router.use('/subsubcategory', subsubcategoryread);
router.use('/subsubcategory', subsubcategoryupdate);
router.use('/subsubcategory', subsubcategorycreate);

import Protect from '../../middleware/authmiddleware.js'; 
router.use(Protect);

export default router;