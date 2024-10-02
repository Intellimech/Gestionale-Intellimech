import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js"; // Ensure the correct path
import Logger from "../../utils/logger.js"; // Ensure the correct path

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());

const __dirname = path.resolve();

router.post("/create", async (req, res) => {
    try {
        
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const category = await sequelize.models.Category.create({
            name: name,
        });
        res.status(201).json({
            message: "Category created successfully",
            category: category,
        });
    } catch (error) {
        Logger("error",error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

export default router;
