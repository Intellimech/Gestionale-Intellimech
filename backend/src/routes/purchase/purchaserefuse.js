import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
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
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const Purchase = sequelize.models.Purchase;

    Purchase.update({
        status: "Rifiutato",
    }, {
        where: {
            id_purchase: req.params.id,
        },
    })
    .then((purchase) => {
        res.status(200).json({
            message: "Purchase refused",
            purchase: purchase,
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
