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
import { decode } from "punycode";

// Setup the express router
const router = express.Router();

const __dirname = path.resolve();

const public_key = fs.readFileSync(
    path.resolve(__dirname, "./src/keys/private.key")
  );

router.delete("/delete", (req, res) => {
    // Get the user from the database
    try {
    const { user_id } = req.body;

    if (!user_id) {
        res.status(400).json({
        message: "Bad request, view documentation for more information",
        });
        return;
    }

    const User = sequelize.models.User;

    const token = req.headers["authorization"]?.split(" ")[1] || "";
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const decoded = jwt.verify(token, public_key, {
        algorithms: ["RS256"],
    });

    User.update(
        {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: decoded.id
        },
        { where: { id_user: user_id } }
      )
        .then((result) => {
          if (result[0] > 0) {
            res.status(200).json({
              message: "User(s) deleted",
            });

            Logger("info", `User deleted`, req, "user");
          } else {
            res.status(404).json({
              message: "No user found for deletion",
            });
          }
        })
        .catch((error) => {
            Logger("error", "Error deleting user: " + error.message, req, "user");
            res.status(500).json({
                message: "Internal server error",
            });
        });
    } catch (error) {
        Logger("error", "Error deleting user: " + error.message, req, "user");
        res.status(500).json({
          message: "Internal server error",
        });
    }
});      

export default router;