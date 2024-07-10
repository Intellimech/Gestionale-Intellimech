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

// Setup the express router
const router = express.Router();

router.put("/update", (req, res) => {
    // Get the user from the database
    const { user_id, name, surname, username, password, email, role } = req.body;
    if (!name || !surname || !username || !password || !email || !role) {
        res.status(400).json({
        message: "Bad request, view documentation for more information",
        });
        return;
    }
    const User = sequelize.models.User;

    User.findOne({ where: { id_user: user_id } })
        .then((user) => {
        if (user) {
            // Hash the password
            bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                res.status(500).json({
                message: "Internal server error",
                });
                Logger("error", err);
            } else {
                user.name = name;
                user.surname = surname;
                user.username = username;
                user.password = hash;
                user.email = email;
                user.role = role;
                user.updatedAt = new Date();
                user.save();
                res.status(200).json({
                message: "User updated",
                });
            }
            });
        } else {
            res.status(400).json({
            message: "User does not exist",
            });
        }
        })
        .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
        Logger("error", err);
        });
});

export default router;