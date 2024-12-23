import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import mail from "../../utils/smtp.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

const __dirname = path.resolve();

// Public and private keys
const publicKey = fs.readFileSync(
    path.resolve(__dirname, "./src/keys/public.key")
);

// Function to generate the password
const generatePassword = () => {
    const length = 24;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = '';
    for (let i = 0; i < length; i++) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return retVal;
};
router.post("/create", async (req, res) => {
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const { 
        email, 
        name, 
        surname, 
        birthdate, 
        username, 
        role, 
        group, 
        subGroup,
        contractType,
        hWeek,
        TaxIdCode,
        Phone,
        hiringdate,
        drivingLicenseExp,
        country,
        streetaddress,
        city,
        province,
        zip,
        sessionId,
        changepass,
        birthprovince,
        businessphone,
        qualification,
        institute
    } = req.body;

    
  
    try {
        Logger("info", `Received request to create user: ${JSON.stringify(req.body)}`);


     
        const User = sequelize.models.User;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            Logger("warn", `User already exists: ${email}`);
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await User.create({
            name,
            surname,
            birthdate,
            username,
            email,
            password: hashedPassword,
            role,
            isActive: false,            
            isDeleted: false,          
            lastLoginAt: null,
            lastLoginIp: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            createdBy: user.id_user,
            updatedBy: user.id_user,
            deletedBy: null,
            group,
            subGroup,
            contractType,
            institute,
            qualification,
            hWeek,
            TaxIdCode,
            Phone,
            hiringdate,
            drivingLicenseExp,
            country,
            streetaddress,
            city,
            province,
            zip,
            sessionId,
            changepass,
            birthprovince,
            businessphone
        });

        Logger("info", `User created: ${newUser.email}`);

        // Send the email
        await mail.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Account creato",
            text: `Il tuo account è stato creato. La tua password è: ${password}`,
        });

        Logger("info", `Email sent to: ${email}`);
        return res.status(200).json({ message: "User created" });

    } catch (err) {
        
        Logger("error", `Internal server error: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
