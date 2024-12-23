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
    // Get the role from the database
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const Subcategory = sequelize.models.Subcategory;

    const Category = sequelize.models.Category;
    Subcategory.findAll({
        
        include: [
            {
                model: Category,
                attributes: ["name", "id_category"],
            },
        ],
    })
    .then((subcategories) => {
        res.status(200).json({
            message: "Subcategories found",
            subcategories: subcategories,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

router.get("/read/:category", (req, res) => {
    // Get the subcategory from the database where the category is the same as the one in the request
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const category = req.params.category;
    if (!category) {
        res.status(400).json({
            message: "Category not provided",
        });
        return;
    }
    const Subcategory = sequelize.models.Subcategory;
    const Category = sequelize.models.Category;

    Subcategory.findAll({
        where: {
            category: category,
        },
        include: [
            {
                model: Category,
                attributes: ["name"],
            },
        ],
    })
    .then((subcategories) => {
        res.status(200).json({
            message: "Subcategories found",
            subcategories: subcategories,
        });
    })
});

export default router;
