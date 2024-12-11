import express from 'express';
import sequelize from '../../utils/db.js';
import Reporting from '../../models/reporting.js';

const router = express.Router();

router.post('/create/', async (req, res) => {
  const { date, task_percentage, id_certification, id_company, hours, id_job, text,id_reportingindirect, id_event, id_task, percentage } = req.body;
  const user = req.user;

  if(!id_reportingindirect) {
    res.status(400).json({
      message: 'Reporting Indirect ID is required',
    });
    return;
  }
  
  try {
    // Create a new record with null checks, make hour as integer
    const reportingindirect = await Reporting.create({
      date: date || null,
      hour: hours || null,
      event: id_event || null,
      company: id_company || null,
      job: id_job || null,
      text: text || null,
      certifications: id_certification || null,
      reportingIndirect: id_reportingindirect || null,
      task: id_task || null,
      createdBy: user.id_user,
    });
    const Tasks = sequelize.models.Tasks;
    if (task_percentage) {
      await Tasks.update(
        { percentage: task_percentage },
        { where: { id_task: id_task } }
      );
    }

    res.status(201).json({
      message: 'Reporting created',
      reportingindirect,
    });
  } catch (error) {
    console.error('Error creating Reporting Indirect:', error);
    res.status(500).json({
      message: 'Error creating Reporting Indirect',
      error: error.message,
    });
  }
});

export default router;
