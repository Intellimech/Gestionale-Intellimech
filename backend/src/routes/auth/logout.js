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
import cookieparser from "cookie-parser";
import cookie from "cookie";
import logger from "../../utils/logger.js";

 
const router = express.Router();

const __dirname = path.resolve();

router.use(bodyParser.json());
router.use(cors());
router.use(cookieparser());


router.post("/logout", async (req, res) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1] || "";
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const publicKey = fs.readFileSync(
            path.resolve(__dirname, "./src/keys/public.key")
        );

        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
        });

        const User = sequelize.models.User;

        User.update(
            { isActive: false },
            {
                where: {
                    id_user: decoded.id,
                },
            }
        );
        
        logger("info", `User logged out`, req, "logout");
        res.status(200).json({
            message: "Logout success",
        });
        
    } catch (error) {
        Logger("error", error.message, req, "logout");
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
