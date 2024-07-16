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


router.post("/changepassword", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Bad request, view documentation for more information",
      });
    }

    const User = sequelize.models.User;
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "User is not active",
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        message: "User is not verified",
      });
    }

    if (user.isDeleted === true) {
      return res.status(403).json({
        message: "User is deleted",
      });
    }

    if (user.changepass === true) {
      //set it as false
      await User.update({ changepass: false }, { where: { email: email } });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await User.update({ password: hash, changepass: false, sessionId: null }, { where: { email: email } });

    res.status(200).json({
      message: "Password changed successfully",
    });
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
