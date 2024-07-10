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


router.get("/verify", async (req, res) => {
    //verify if token is valid and if user is active or not deleted and return user data and get also the information about role and permissionss
    try {
        const token = req.headers["authorization"]?.split(" ")[1] || "";
        const User = sequelize.models.User;
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

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = await User.findOne({
            where: { id_user: decoded.id, sessionId: decoded.sessionId },
            attributes: ["id_user", "name", "surname", "birthdate", "username", "email", "isDeleted", "isActive", "createdAt", "updatedAt", "sessionId", "subgroup"],
            include: [
                {
                    model: sequelize.models.Role,
                    attributes: ["id_role", "name"],
                },
                {
                    model: sequelize.models.Group,
                    attributes: ["id_group", "name"],
                },
                {
                    model: sequelize.models.Subgroup,
                    attributes: ["id_subgroup", "name"],
                },
                {
                    model: sequelize.models.Notification,
                    as: 'receiverUser', // Make sure this matches the alias
                    attributes: ['id_notify', 'title', 'message', 'type']
                }
            ],
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        //check if the sessionId is the same in the token and in the user
        if (user.sessionId !== decoded.sessionId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const respuser = {
            id_user: user.id_user,
            name: user.name,
            surname: user.surname,
            birthdate: user.birthdate,
            username: user.username,
            email: user.email,
            role: user.Role.name,
            group: user.Group.name,
            subgroup: user.Subgroup.name,
            notification: user.receiverUser,
        };

        return res.status(200).json({
            message: "Authorized",
            user: respuser,
        });
    } catch (error) {
        Logger("error", error, null, "auth");
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
});


export default router;
