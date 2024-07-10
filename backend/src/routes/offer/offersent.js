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

router.post("/sent/:id", (req, res) => {
    // Get the role from the database
    const Offer = sequelize.models.Offer;

    Offer.update({
        status: "Inviata al cliente",
    }, {
        where: {
            id_offer: req.params.id,
        },
    })
    .then((offer) => {
        res.status(200).json({
            message: "Offer sent",
            offer: offer,
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
