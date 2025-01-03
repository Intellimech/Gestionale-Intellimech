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
import ContractType from "../../models/contracttype.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    // Get the role from the database
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const ContractType = sequelize.models.ContractType;

    ContractType.findAll({
        where: {
            isDeleted: false,
        },
    })
    .then((contracts) => {
        if (contracts) {
            res.status(200).json({
                message: "Contracts  found",
                contracts: contracts,
            });
        } else {
            res.status(400).json({
                message: "Roles do not exist",
            });
        }
    })
    .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;