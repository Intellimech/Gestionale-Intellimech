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
import mail from "../../utils/smtp.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

const __dirname = path.resolve();

//public and private keys
const publicKey = fs.readFileSync(
    path.resolve(__dirname, "./src/keys/public.key")
);

// write a function to generate the password
const generatePassword = () => {
    const length = 24,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = [];
    for (let i = 0; i < length; ++i) {
        retVal.push(charset.charAt(Math.floor(Math.random() * charset.length)));
    }
    return retVal.join("");
};

router.post("/create", (req, res) => {
    // Get the user from the database
    const { email, name, surname, birthdate, role, group, city, streetaddress, country, province } = req.body;
    // get the token from the header
    const token = req.headers["authorization"]?.split(" ")[1] || "";
    // check if the token is valid
    if(!token) {
        res.status(401).json({
            message: "Unauthorized",
        });
        Logger("debug", "Unauthorized");
        return;
    }

    jwt.verify(token, publicKey, (err, decoded) => {
        if (err) {
            res.status(401).json({
            message: "Unauthorized",
            });
            Logger("debug", "Unauthorized");
            return;
        }

        if (!email || !name || !surname || !role || !group) {
            res.status(400).json({
            message: "Bad request, view documentation for more information",
            });
            //now write a log indicating the missing parameters
            Logger("debug", "Bad request, missing parameters");
            return;
        }

        const username = email.split("@")[0];
        const User = sequelize.models.User;
        User.findOne({ where: { email: email } })
            .then((user) => {
            if (user) {
                res.status(400).json({
                message: "User already exists",
                });
            } else {
                // Hash the password
                const password = generatePassword();
                bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({
                    message: "Internal server error",
                    });
                    Logger("debug", "Error: " + err);
                } else {
                    // Create the user
                    User.create({
                        name: name,
                        surname: surname,
                        birthdate: birthdate,
                        username: username,
                        email: email,
                        password: hash,
                        role: role,
                        isdeleted: false,
                        isActive: false,
                        lastLoginAt: null,
                        lastLoginIp: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedBy: null,
                        addedBy: decoded.id,
                        updatedBy: decoded.id,
                        deletedBy: null,
                        group: group,
                        subgroup: null,
                        contracttype: null,
                        hweek: null,
                        taxidcode: null,
                        drivinglicensecode: null,
                        drivinglicenseexp: null,
                        workingsite: null,
                        
                    })
                    .then((user) => {
                        // Send the email
                        Logger("debug", `Password: ${password}`);

                        // mail.sendMail({
                        //     from: process.env.SMTP_USER,
                        //     to: email,
                        //     subject: "Account created",
                        //     text: `Your account has been created, your username is ${username} and your password is ${password}`,
                        // })
                        // .then((info) => {
                        //     Logger("debug", `Email sent: ${info.response}`);
                        // })

                        res.status(200).json({
                        message: "User created",
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                        message: "Internal server error",
                        });
                        Logger("debug", "Error: " + err);
                    });
                }
                });
            }
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Internal server error",
                });
                Logger("debug", "Error: " + err);
            });
    });
});

export default router;