import express from 'express';
import { Sequelize, Op } from 'sequelize'; // Import Op explicitly
import sequelize from '../../utils/db.js';
import Reporting from '../../models/reporting.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
    const user = req.user;

    try {
        const reporting = await Reporting.findAll({
            where: { 
                createdBy: user.id_user,
                createdAt: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: sequelize.models.Tasks,
                    as: 'associatedTask',
                    attributes: ['id_task', 'name'],
                },
                {
                    model: sequelize.models.Job,
                    as: 'associatedJob',
                    attributes: ['id_job', 'name'],
                },
                {
                    model: sequelize.models.ReportingIndirect,
                    as: 'indirectReporting',
                    attributes: ['id_reportingindirect', 'name'],
                },
                {
                    model: sequelize.models.Event,
                    as: 'associatedEvent',
                    attributes: ['id_event', 'name'],
                }
            ]
        });

        res.status(200).json({
            message: 'Reporting found',
            reporting,
        });
    } catch (error) {
        console.error('Error fetching Reporting:', error);
        res.status(500).json({
            message: 'Error fetching Reporting',
            error: error.message,
        });
    }
});

export default router;