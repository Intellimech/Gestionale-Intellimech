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

router.get("/create/", (req, res) => {
    // Get the role from the database
    const QuotationRequest = sequelize.models.QuotationRequest;

    QuotationRequest.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        technicalarea: req.body.technicalarea,
        status: req.body.status,
        company: req.body.company,
    })
    .then((quotationrequest) => {
        res.status(200).json({
            message: "Quotation Request created",
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
