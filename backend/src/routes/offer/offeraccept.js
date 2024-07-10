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

router.post("/accept/:id", async (req, res) => {
    // Get the role from the database
    const Offer = sequelize.models.Offer;

    try {
        const updatedOffer = await Offer.update(
            {
                status: "Approvata",
            },
            {
                where: {
                    id_offer: req.params.id,
                },
            }
        );

        // Create the sales order
        const SalesOrder = sequelize.models.SalesOrder;
        const countOffer = await SalesOrder.count({ distinct: "name" });
        const name =
            "ODV" +
            new Date().getFullYear().toString().substr(-2) +
            "_" +
            (countOffer + 1).toString().padStart(5, "0");

        const offer = await Offer.findOne({
            where: {
                id_offer: req.params.id,
            },
        });

        const salesOrder = await SalesOrder.create({
            name: name,
            offer: offer.id_offer,
        });

        res.status(200).json({
            message: "Offer approved",
            offer: offer,
            salesorder: salesOrder,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
