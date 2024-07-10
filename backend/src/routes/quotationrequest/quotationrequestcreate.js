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

const publickey = fs.readFileSync("./src/keys/public.key", "utf8");

router.post("/create/", (req, res) => {
    // Get the role from the database
    const { description, category, subcategory, technicalarea, company, name } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    
    if (!description || !category || !subcategory || !technicalarea || !company) {
        return res.status(400).json({
            message: "Bad request, view documentation for more information",
        });
    }

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    //get the company
    const Company = sequelize.models.Company;
    const User = sequelize.models.User;
    const QuotationRequest = sequelize.models.QuotationRequest;
    const Category = sequelize.models.Category;

    jwt.verify(token, publickey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
            //generate the name picking the first 3 letters of the category and the first 3 letters consonant of company
            const companydata = await Company.findOne({
                where: {
                    id_company: company,
                },
            });
            
            const categorydata = await Category.findOne({
                where: {
                    id_category: category,
                },
            });

            const countoffer = await QuotationRequest.findAll({
                group: ["name"],
            });
            
            const offerCount = countoffer.length;
            console.log("Number of offers:", offerCount);
    
            let name;
     
            if (!name || name === "") {
                name = "RDO" + new Date().getFullYear().toString().substr(-2) + "_" + (offerCount + 1).toString().padStart(5, "0");
            }
            
            QuotationRequest.create({
                name: name,
                description: description,
                category: category,
                subcategory: subcategory,
                technicalarea: technicalarea,
                company: company,
                createdBy: decoded.id,
                status: "In Attesa"
            })
            .then((quotationrequest) => {
                res.status(200).json({
                    message: "Quotation Request created",
                    quotationrequest: quotationrequest,
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: "Internal server error",
                });
            });
    });
});

export default router;
