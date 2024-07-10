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

router.get("/read/", (req, res) => {
    //get from the db all the companies
    const company = sequelize.models.Company;
    let result = [];
    try {
        switch (req.query.filter) {
            case "Suppliers":
                company.findAll({
                    where: {
                        isSuppliers: true
                    }
                })
                .then((companies) => {
                    result = companies;
                    sendResponse(result, res);
                })
                .catch((err) => {
                    throw new Error(err);
                });
                break;

            case "partner":
                company.findAll({
                    where: {
                        isPartner: true
                    }
                })
                .then((companies) => {
                    result = companies;
                    sendResponse(result, res);
                })
                .catch((err) => {
                    throw new Error(err);
                });
                break;
            case "Customers":
                //return only the companies that isClient is true
                company.findAll({
                    where: {
                        isClient: true
                    }
                })
                .then((companies) => {
                    result = companies;
                    sendResponse(result, res);
                })
                .catch((err) => {
                    throw new Error(err);
                });
                break;
            default:
                company.findAll()
                .then((companies) => {
                    result = companies;
                    sendResponse(result, res);
                })
                .catch((err) => {
                    throw new Error(err);
                });
                break; 
        }
    } catch (err) {
        Logger("error", err, null, "companyread");
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/read/:id", (req, res) => {
    //get from the db the company with the id specified in the url
    const company = sequelize.models.Company;
    let result = [];
    try {
        //the id is the code of the company
        company.findAll({
            where: {
                Code: req.params.id
            }
        })
        .then((companies) => {
            result = companies;
            sendResponse(result, res);
        })
        .catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        Logger("error", err, null, "companyread");
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/read/:id/invoices", (req, res) => {
    //get from the db the invoices of the company with the id specified in the url
    const company = sequelize.models.Company;
    const invoice = sequelize.models.Invoices;
    let result = [];
    try {
        //the id is the code of the company
        company.findAll({
            where: {
                Code: req.params.id
            }
        })
        .then((companies) => {
            result = companies;
            if (result.length > 0) {
                invoice.findAll({
                    where: {
                        InvoiceCompany: result[0].id_company
                    }
                })
                .then((invoices) => {
                    result = {company: companies, invoice: invoices };
                    sendResponse(result, res);
                })
                .catch((err) => {
                    throw new Error(err);
                });
            } else {
                sendResponse(result, res);
            }
        })
        .catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        Logger("error", err, null, "companyread");
        res.status(500).json({
            message: "Internal server error",
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