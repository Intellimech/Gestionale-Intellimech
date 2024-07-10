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
import { v4 as uuidv4 } from 'uuid';

 
const router = express.Router();

const __dirname = path.resolve();

router.use(bodyParser.json());
router.use(cors());
router.use(cookieparser());


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Bad request, view documentation for more information",
      });
    }

    const User = sequelize.models.User;
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const privateKey = fs.readFileSync(
          path.resolve(__dirname, "./src/keys/private.key")
        );

        let sessionId = uuidv4();

        const token = jwt.sign(
          { id: user.id_user , sessionId: sessionId},
          privateKey,
          {
            algorithm: "RS256",
            expiresIn: "1h",
          }
        );

        // update last login and is active
        user.isActive = true;
        user.lastLoginAt = new Date();
        user.sessionId = sessionId
        if(req.ip === "::1") {
            user.lastLoginIp = "localhost";
        } else {
            user.lastLoginIp = req.ip;
        }
        await user.save();

        res.status(200).json({
          message: "Auth successful",
          access_token: token,
        });

        Logger("info", "User login successful for [" + email + "]", null, "auth")
      } else {
        res.status(401).json({
          message: "Incorrect password or username",
        });
        Logger("error", "Auth failed: Incorrect password [" + email + "]", null, "auth");
      }
    } else {
      res.status(401).json({
        message: "Incorrect password or username",
      });
      Logger("error", "Auth failed: User not found [" + email + "]", null, "auth");
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error, contact the administrator",
    });
    Logger("error", "Auth failed -> " + error.message, {
      stackTrace: error.stack,
    }, req, "auth");
  }
});

export default router;
