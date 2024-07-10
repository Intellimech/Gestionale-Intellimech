import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/stats/", (req, res) => {
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findAll({
            attributes: [
                [sequelize.fn('YEAR', sequelize.col('ReceptionDate')), 'year'],
                [sequelize.fn('SUM', sequelize.col('Amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('Amount')), 'count'],
                'InvoiceType'
            ],
            group: [sequelize.fn('YEAR', sequelize.col('ReceptionDate')), 'InvoiceType']
        }).then((invoices) => {
            result = invoices;
            sendResponse(result, res);
        }).catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        Logger('error', err, null, 'invoices');
        res.status(500).json({
            message: "Error",
            value: err
        });
    }
});

router.get("/stats/:year", (req, res) => {
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('ReceptionDate')), 'month'],
                [sequelize.fn('SUM', sequelize.col('Amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('Amount')), 'count'],
                'InvoiceType'
            ],
            where: sequelize.where(sequelize.fn('YEAR', sequelize.col('ReceptionDate')), req.params.year),
            group: [sequelize.fn('MONTH', sequelize.col('ReceptionDate')), 'InvoiceType']
        }).then((invoices) => {
            result = invoices;
            sendResponse(result, res);
        }).catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        Logger('error', err, null, 'invoices');
        res.status(500).json({
            message: "Error",
            value: err
        });
    }
});

router.get("/stats/:year/:month", (req, res) => {
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findAll({
            attributes: [
                [sequelize.fn('DAY', sequelize.col('ReceptionDate')), 'day'],
                [sequelize.fn('SUM', sequelize.col('Amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('Amount')), 'count'],
                'InvoiceType'
            ],
            where: sequelize.where(sequelize.fn('YEAR', sequelize.col('ReceptionDate')), req.params.year),
            where: sequelize.where(sequelize.fn('MONTH', sequelize.col('ReceptionDate')), req.params.month),
            group: [sequelize.fn('DAY', sequelize.col('ReceptionDate')), 'InvoiceType']
        }).then((invoices) => {
            result = invoices;
            sendResponse(result, res);
        }).catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        Logger('error', err, null, 'invoices');
        res.status(500).json({
            message: "Error",
            value: err
        });
    }
});

function sendResponse(result, res) {
    res.status(200).json({
        message: "Result found",
        value: result
    });
}

export default router;