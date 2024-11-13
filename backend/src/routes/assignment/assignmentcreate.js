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
        
        const { description,code } = req.body;

    
        const assignment = await sequelize.models.Assignment.create({
            description: description,
            code: code,
        });
        res.status(201).json({
            message: "Assignment created successfully",
   
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
