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

 
const router = express.Router();

const __dirname = path.resolve();

router.use(bodyParser.json());
router.use(cors());
router.use(cookieparser());


router.post("/force/:action/:userid", async (req, res) => {
    //verify if token is valid and if user is active or not deleted and return user data and get also the information about role and permissionss
    try {
        console.log(req.headers["authorization"])
        const token = req.headers["authorization"]?.split(" ")[1] || "";
        const { action, userid } = req.params;
        const User = sequelize.models.User;
        if (!token) {
            console.log("No token");
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

        if (!decoded) {
            console.log("No decoded");
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        let user = await User.findOne({
            where: { id_user: decoded.id, sessionId: decoded.sessionId },
            attributes: ["id_user", "name", "surname", "birthdate", "username", "email", "isDeleted", "isActive", "createdAt", "updatedAt", "sessionId"],
        });

        if (!user || !user.isActive) {
            console.log("No user");
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        user = await User.findOne({
            where: { id_user: userid }
        });

        switch(action) {
            case "logout":
                user.sessionId = null;
                user.isActive = false;
                await user.save();
                return res.status(200).json({
                    message: "User logged out",
                });
            case "changePassword":
                user.changepass = true;
                await user.save();
                return res.status(200).json({
                    message: "User must change password",
                });            
            default:
                return res.status(400).json({
                    message: "Bad request, view documentation for more information",
                });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});


export default router;
