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
    // Get the subsubcategory from the database
    const Subsubcategory = sequelize.models.Subsubcategory;
    const Subcategory = sequelize.models.Subcategory;
    const Category = sequelize.models.Category;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    Subsubcategory.findAll({
        include: [
            {
                model: Subcategory,
                attributes: ["name", "id_subcategory"],
                include: [
                    {
                        model: Category,
                        attributes: ["name", "id_category"],
                        
                    },
                ],
            },
        ],

    })
    .then((subsubcategories) => {
        if (subsubcategories) {
            res.status(200).json({
                message: "Subsubcategories found",
                subsubcategories: subsubcategories,
            });
        } else {
            res.status(400).json({
                message: "Subsubcategories do not exist",
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