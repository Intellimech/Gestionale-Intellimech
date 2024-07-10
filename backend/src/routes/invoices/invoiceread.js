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
import { Sequelize, Op } from 'sequelize';
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    //get from the db all the invoices
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        //get all the invoices making join with the company table
        invoice.findAll({
            include: [
            {
                model: sequelize.models.Company,
                required: true
            },
            {
                model: sequelize.models.InvoiceLine,
                required: false
            }
            ]
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

router.get("/read/:id", (req, res) => {
    //get from the db the invoice with the id passed
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findOne({
            where: {
                id_invoices: req.params.id
            },
            include: {
                model: sequelize.models.Company,
                required: true
            }
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

// only the invoice of the specified year splitted by pages of 15 elements
router.get("/read/date/:year", (req, res) => {
    //get from the db the invoice of the specified year
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findAll({
            where: sequelize.where(sequelize.fn('YEAR', sequelize.col('ReceptionDate')), req.params.year),
            include: {
                model: sequelize.models.Company,
                required: true
            }
        }).then((invoices) => {
            result = invoices;
            //now I have to split the result in pages of 15 elements
            let pages = [];
            let page = [];
            let count = 0;
            for (let i = 0; i < result.length; i++) {
                if (count < 15) {
                    page.push(result[i]);
                    count++;
                } else {
                    pages.push(page);
                    page = [];
                    count = 0;
                }
            }
            sendResponse(pages, res);
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

// only the invoice of the specified year and month splitted by pages of 15 elements
router.get("/read/date/:year/:month", (req, res) => {
    //get from the db the invoice of the specified year and month
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        invoice.findAll({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('ReceptionDate')), req.params.year),
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('ReceptionDate')), req.params.month)
                ]
            },
            include: {
                model: sequelize.models.Company,
                required: true
            }
        }).then((invoices) => {
            result = invoices;
            //now I have to split the result in pages of 15 elements
            let pages = [];
            let page = [];
            let count = 0;
            for (let i = 0; i < result.length; i++) {
                if (count < 15) {
                    page.push(result[i]);
                    count++;
                } else {
                    pages.push(page);
                    page = [];
                    count = 0;
                }
            }
            sendResponse(pages, res);
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