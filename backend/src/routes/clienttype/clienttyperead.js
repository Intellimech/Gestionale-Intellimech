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
    // Get the role from the database
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const ClientType = sequelize.models.ClientType;

    ClientType.findAll({
       
    })
    .then((clients) => {
        console.log("Client Types Retrieved:", clients);
        if (clients) {
            res.status(200).json({
                message: "Clients found",
                clients: clients,
            });
        } else {
            res.status(404).json({ message: "No client types found" });
        }
    })
    .catch((err) => {
        console.error("Database error:", err);  // Aggiungi questo per loggare errori
        res.status(500).json({ message: "Client server error" });
    });
    
});

export default router;