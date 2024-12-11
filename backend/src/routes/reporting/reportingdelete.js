import express from 'express';
import { Sequelize, Op } from 'sequelize';
import sequelize from '../../utils/db.js';
import Reporting from '../../models/reporting.js';

const router = express.Router();

router.delete('/delete/:id_reporting', async (req, res) => {
    const { id_reporting } = req.params;
    const user = req.user;

    if (!id_reporting) {
        return res.status(400).json({
            message: 'Reporting ID is required',
        });
    }

    try {
        const reporting = await Reporting.findOne({
            where: {
                id_reporting: id_reporting,
                createdBy: user.id_user,
            },
        });

        if (!reporting) {
            return res.status(404).json({
                message: 'Reporting not found',
            });
        }

        await reporting.destroy();

        res.status(200).json({
            message: 'Reporting deleted',
        });
    } catch (error) {
        console.error('Error deleting Reporting:', error);
        res.status(500).json({
            message: 'Error deleting Reporting',
            error: error.message,
        });
    }
});

export default router;