import express from 'express';
import sequelize from '../../utils/db.js';
import Event from '../../models/event.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
  try {
    // Fetch all records with plain data
    const event = await Event.findAll();

    res.status(200).json({
      message: 'Event found',
      events: event,
    });
  } catch (error) {
    console.error('Error fetching Reporting Indirect:', error);
    res.status(500).json({
      message: 'Error fetching Reporting Indirect',
      error: error.message,
    });
  }
});

export default router;