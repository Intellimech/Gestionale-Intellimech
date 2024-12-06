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

// Funzione per formattare i nomi
function formatName(name) {
    return name
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Funzione per inviare la risposta formattando i nomi
function sendResponse(result, res) {
    if (Array.isArray(result)) {
        result = result.map(item => {
            if (item.name) {
                item.name = formatName(item.name);
            }
            return item;
        });
    } else if (result && typeof result === "object") {
        if (result.name) {
            result.name = formatName(result.name);
        }
    }

    res.status(200).json({
        message: "Result found",
        value: result
    });
}

// Rotte
router.get("/read/", (req, res) => {
    const user = req.user;  // Assuming req.user is populated by the authentication middleware
    const company = sequelize.models.Company;
    let result = [];

    try {
        switch (req.query.filter) {
            case "suppliers":
                company.findAll({
                    where: {
                        isSuppliers: true
                    },
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

            case "client":
                company.findAll({
                    where: {
                        isClient: true
                    },
                    include: [
                        {
                            model: sequelize.models.ClientType,
                            attributes: ["id_clienttype", "code", "description"],
                        },
                    ]
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
                console.log("default")
                company.findAll({
                    include: [
                        {
                            model: sequelize.models.ClientType,
                            attributes: ["id_clienttype", "code", "description"],
                        },
                    ]
                })
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
    const company = sequelize.models.Company;
    let result = [];

    try {
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
    const company = sequelize.models.Company;
    const invoice = sequelize.models.Invoices;
    let result = [];

    try {
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
                    result = { company: companies, invoice: invoices };
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

export default router;
