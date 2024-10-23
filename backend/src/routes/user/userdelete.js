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


    const user = req.user;  // Assuming req.user is populated by the authentication middleware


    User.update(
        {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: user.id_user
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