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

// __dirname
const __dirname = path.resolve();

// Route to handle subcategory creation
router.post('/create', async (req, res) => {
    try {
      const { name, code } = req.body;
  
      // Validate input
      if (!name || !code) {
        return res.status(400).json({
          message: 'Both name and code are required',
        });
      }
  
      // Ensure the Subcategory model is loaded
      const TechnicalArea = sequelize.models.TechnicalArea;
      if (!TechnicalArea) {
        throw new Error('Technical Area model is not loaded');
      }
  
      // Create subcategory
      const technicalarea = await TechnicalArea.create({
        name,
        code,
      });
  
      res.status(201).json({
        message: 'Tecnhical Area created successfully',
        technicalarea,
      });
    } catch (error) {
      Logger.error(error);
  
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  });
  

// router.get("/create/", (req, res) => {
//     // Get the role from the database
//     const QuotationRequest = sequelize.models.QuotationRequest;

//     QuotationRequest.create({
//         name: req.body.name,
//         description: req.body.description,
//         category: req.body.category,
//         subcategory: req.body.subcategory,
//         technicalarea: req.body.technicalarea,
//         status: req.body.status,
//         company: req.body.company,
//     })
//     .then((quotationrequest) => {
//         res.status(200).json({
//             message: "Quotation Request created",
//             quotationrequest: quotationrequest,
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//             message: "Internal server error",
//         });
//     });
// });

export default router;
