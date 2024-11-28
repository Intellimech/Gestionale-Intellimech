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

router.get("/read/", (req, res) => {
    // Get the purchaserow from the database
    const PurchaseRow = sequelize.models.PurchaseRow;

    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    PurchaseRow.findAll({
        include: [
            {
              model: sequelize.models.Category,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name"],
            },
            {
                model: sequelize.models.Subsubcategory,
                attributes: ["name"],
              },
          ]
    })
    .then((purchaserows) => {
        if (purchaserows) {
            res.status(200).json({
                message: "PurchaseRows found",
                purchaserows: purchaserows,
            });
        } else {
            res.status(400).json({
                message: "PurchaseRows do not exist",
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