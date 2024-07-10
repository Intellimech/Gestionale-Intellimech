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

router.post("/refuse/:id", (req, res) => {
    // Get the role from the database
    const QuotationRequest = sequelize.models.QuotationRequest;

    QuotationRequest.update({
        status: "Rifiutata",
    }, {
        where: {
            id_quotationrequest: req.params.id,
        },
    })
    .then((quotationrequest) => {
        res.status(200).json({
            message: "Quotation Request refused",
            quotationrequest: quotationrequest,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;
