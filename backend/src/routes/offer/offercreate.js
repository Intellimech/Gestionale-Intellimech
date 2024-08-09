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

router.post("/create/", async (req, res) => {
    let { name, amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks } = req.body;
    const user = req.user;

    if (!amount || !hour || !estimatedstart || !estimatedend || !quotationrequest || !team || !tasks) {
        return res.status(400).json({
            message: "Bad request, view documentation for more information",
        });
    }

    // Ensure the date is valid
    if (isNaN(Date.parse(estimatedstart)) || isNaN(Date.parse(estimatedend))) {
        return res.status(400).json({
            message: "Invalid date format for estimatedstart or estimatedend",
        });
    }

    const Offer = sequelize.models.Offer;

    try {
        const countoffer = await Offer.findAll({
            group: ["name"],
        });

        const offerCount = countoffer.length;
        console.log("Number of offers:", offerCount);

        // Generate offer name if not provided
        const offerName = name || `OFF${new Date().getFullYear().toString().substr(-2)}_${(offerCount + 1).toString().padStart(5, "0")}`;

        // Create the offer
        const offer = await Offer.create({
            name: offerName,
            amount: amount,
            hour: hour,
            estimatedstart: new Date(estimatedstart),  // Ensure the value is a valid Date object
            estimatedend: new Date(estimatedend),      // Ensure the value is a valid Date object
            quotationrequest: quotationrequest,
            createdBy: user.id_user, // Use user ID from req.user
        });

        // Associate teams and tasks with the offer
        await offer.addTeam(team);
        // await offer.addTask(tasks);

        res.status(200).json({
            message: "Offer created",
            offer: offer,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});


export default router;
