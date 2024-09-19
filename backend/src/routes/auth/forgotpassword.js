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
import mail from "../../utils/smtp.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

const generatePassword = () => {
    const length = 24,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = [];
    for (let i = 0; i < length; ++i) {
        retVal.push(charset.charAt(Math.floor(Math.random() * charset.length)));
    }
    return retVal.join("");
};

router.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    
    sequelize.models.User.findOne({
        where: { email: email },
    })
    .then((user) => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a new password
        const newPassword = generatePassword();
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);

        // Update the user password
        user.password = hash;
        user.changepass = true;
        user.save()

        // Send the new password to the user
        mail.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "New password",
            text: `Your new password is: ${newPassword}`,
        });

        return res.status(200).json({ message: "New password sent to email" });
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    });
});

export default router;