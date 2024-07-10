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

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

router.post("/create/", (req, res) => {
    let { amount, hour, estimatedstart, estimatedend, quotationrequest, name, team , tasks} = req.body;
    const token = req.headers.authorization.split(" ")[1];

    if (!amount || !hour || !estimatedstart || !estimatedend || !quotationrequest || !team || !tasks) {
        return res.status(400).json({
            message: "Bad request, view documentation for more information",
        });
    }

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const Offer = sequelize.models.Offer;
    
    jwt.verify(token, publickey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const countoffer = await Offer.findAll({
            group: ["name"],
        });
        
        const offerCount = countoffer.length;
        console.log("Number of offers:", offerCount);

        let name;
 
        if (!name || name === "") {
            name = "OFF" + new Date().getFullYear().toString().substr(-2) + "_" + (offerCount + 1).toString().padStart(5, "0");
        }

        Offer.create({
            name: name,
            amount: amount,
            hour: hour,
            estimatedstart: estimatedstart,
            estimatedend: estimatedend,
            quotationrequest: quotationrequest,
            createdBy: decoded.id,
        })
        .then((offer) => {
            for (const teamMember of team) {
                offer.addTeam(teamMember);
            }

            for (const task of tasks) {
                offer.addTask(task);
            }
            res.status(200).json({
                message: "Offer created",
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
});

export default router;
