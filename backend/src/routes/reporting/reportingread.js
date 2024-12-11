import express from 'express';
import { Sequelize, Op } from 'sequelize';
import sequelize from '../../utils/db.js';
import Reporting from '../../models/reporting.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
    const { date } = req.query; // Changed from req.body to req.query for GET request
    const user = req.user;

    if (!date) {
        return res.status(400).json({
            message: 'Date is required',
        });
    }

    try {
        // Parse the input date and create a range for the entire day
        const inputDate = new Date(date);
        const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

        const reporting = await Reporting.findAll({
            where: { 
                createdBy: user.id_user,
                date: {
                    [Op.between]: [startOfDay, endOfDay], // Match the entire day
                },
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: sequelize.models.Tasks,
                    as: 'associatedTask',
                    attributes: ['id_task', 'name', 'description', 'percentage'],
                    include: [
                        {
                            model: sequelize.models.Offer,
                            attributes: ['id_offer', 'name'],
                            include: [
                                {
                                    model: sequelize.models.SalesOrder,
                                    attributes: ['id_salesorder', 'name'],
                                    include: [
                                        {
                                            model: sequelize.models.Job,
                                            attributes: ['id_job', 'name'],
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
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
                    include: [
                        {
                            model: sequelize.models.ReportingIndirect,
                            as: 'ParentIndirect', // Usa l'alias corretto
                            attributes: ['id_reportingindirect', 'name'],
                            include: [
                                {
                                    model: sequelize.models.ReportingIndirect,
                                    as: 'ParentIndirect', // Ricorsivo, ma sempre con lo stesso alias
                                    attributes: ['id_reportingindirect', 'name'],
                                }
                            ],
                        },
                    ],
                },
                {
                    model: sequelize.models.Event,
                    as: 'associatedEvent',
                    attributes: ['id_event', 'name'],
                },
                {
                    model: sequelize.models.Certification,
                    as: 'associatedCertification',
                    attributes: ['id_certification', 'name'],
                },
                {
                    model: sequelize.models.Company,
                    as: 'associatedCompany',
                    attributes: ['id_company', 'name'],
                }
            ]
        });
        
        

        // Check if any reporting was found
        if (reporting.length === 0) {
            return res.status(200).json({
                message: 'No reporting found for the specified date',
                reporting: [],
            });
        }

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