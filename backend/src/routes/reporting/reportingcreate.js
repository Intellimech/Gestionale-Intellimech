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
import Reporting from "../../models/reporting.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.delete("/delete/", (req, res) => {
    const { id_reporting } = req.body;
});

export default router;