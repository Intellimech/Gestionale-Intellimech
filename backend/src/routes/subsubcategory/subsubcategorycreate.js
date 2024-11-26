import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sequelize from '../../utils/db.js'; // Ensure the path is correct
import Logger from '../../utils/logger.js'; // Ensure the path is correct

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());

// Route to handle subsubcategory creation
router.post('/create', async (req, res) => {
  
  const user = req.user;  // Assuming req.user is populated by the authentication middleware

  try {
    const { name, subcategory } = req.body;

    // Validate input
    if (!name || !subcategory) {
      return res.status(400).json({
        message: 'Both name and subcategory are required',
      });
    }

    // Ensure the Subsubcategory model is loaded
    const Subsubcategory = sequelize.models.Subsubcategory;
    if (!Subsubcategory) {
      throw new Error('Subsubcategory model is not loaded');
    }

    // Create subsubcategory
    const subsubcategory = await Subsubcategory.create({
      name,
      subcategory,
    });

    res.status(201).json({
      message: 'Subsubcategory created successfully',
      subsubcategory,
    });
  } catch (error) {
    Logger("error",error);

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

export default router;
