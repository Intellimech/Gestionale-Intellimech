import express from 'express';
import sequelize from '../../utils/db.js';
import Certification from '../../models/certification.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
  try {
    // Fetch all records with plain data
    const certification = await Certification.findAll();

    res.status(200).json({
      message: 'Certification found',
      certifications: certification,
    });
  } catch (error) {
    console.error('Error fetching certification:', error);
    res.status(500).json({
      message: 'Error fetching certification',
      error: error.message,
    });
  }
});

export default router;