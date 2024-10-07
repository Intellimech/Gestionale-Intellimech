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
import WorkingSite from "../../models/workingsite.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    const WorkingSite = sequelize.models.WorkingSite;

    WorkingSite.findAll({
        where: {
            isDeleted: false,
        },
    })
    .then((sites) => {
        if (sites) { // Modifica qui per controllare se ci sono siti
            res.status(200).json({
                message: "Sites found",
                sites: sites,
            });
        } else {
            res.status(404).json({
                message: "No sites found", // Cambiato per 404
            
            });
        }
    })
    .catch((err) => {
        console.error('Database Error:', err); // Log dell'errore
        res.status(500).json({
            message: "Internal server error",
        });
    });
});


export default router;