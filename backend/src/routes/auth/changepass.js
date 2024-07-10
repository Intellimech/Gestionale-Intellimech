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
