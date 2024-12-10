import express from 'express';
import sequelize from '../../utils/db.js';
import Event from '../../models/event.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
  try {
    // Fetch all records with plain data
    const event = await Event.findAll({
      include: [
        {
          model: sequelize.models.EventType,
          as: 'eventType',
        },
      ],
    });

    //return only the name of the eventtype
    const eventList = event.map((event) => {
      return {
        id_event: event.id_event,
        code: event.code,
        name: event.name,
        eventtype: event.eventType.name,
      };
    });

    res.status(200).json({
      message: 'Event found',
      events: eventList,
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