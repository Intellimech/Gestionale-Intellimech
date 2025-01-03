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

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read", (req, res) => {
    // Get the contractrow from the database
    const ContractRow = sequelize.models.ContractRow;

    const user = req.user;  // Assuming req.user is populated by the authentication middleware
    console.log("ContractRow model:", sequelize.models.ContractRow);
    
    ContractRow.findAll({
        include: [
            {
              model: sequelize.models.Category,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subsubcategory,
              attributes: ["name"],
            },
            {
                model: sequelize.models.Contract,
                attributes: ["currency"],
                include: [
                    {
                        model: sequelize.models.Currency,
                        attributes: ["symbol"],
                      },
                      {
                        model: sequelize.models.Recurrence,
                        attributes: ["name"],
                      },
                      {
                        model: sequelize.models.User,
                  as: 'referentUser',
                  attributes: ['id_user', 'name', 'surname'],
                      },

                ]
                
              },
              



          ],
    })
    .then((contractrows) => {
        console.log("ContractRows found:", contractrows);
        if (contractrows.length > 0) {
            res.status(200).json({
                message: "ContractRows found",
                contractrows: contractrows,
            });
        } else {
            res.status(404).json({
                message: "No ContractRows found for the user.",
            });
        }
    })
    
});

export default router;