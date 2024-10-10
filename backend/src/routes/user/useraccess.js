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
import { decode } from "punycode";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();
const publicKey = fs.readFileSync(path.join(__dirname, "./src/keys/public.key"));


router.get("/access/", async (req, res) => {
    // Get the user from the database
 
    const user = req.user;  // Assuming req.user is populated by the authentication middleware


 
    try {
        const User = sequelize.models.User;

        
        const user = await User.findOne({
            where: { id_user: user.id_user },
            include: [
                {
                    model: sequelize.models.Role,
                    attributes: ["id_role", "name"],
                    include: [
                        {
                            model: sequelize.models.Permission,
                            attributes: ["id_permission", "description", "route", "actionType"],
                        },
                    ],
                },
            ],
        });

        if (user) {
            //return only the whole object for every permission
            let permissions = [];
            if (user.Role) {
                permissions = user.Role.Permissions;
            }
            
            
            return res.status(200).json({
                permissions: permissions
            });
        } else {
            return res.status(400).json({
                message: "User does not exist",
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
        });
        Logger("error", err);
    }
});

export default router;
