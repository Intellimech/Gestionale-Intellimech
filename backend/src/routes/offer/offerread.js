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

router.get("/read/", async (req, res) => {
    try {
        
    const user = req.user;  // Assuming req.user is populated by the authentication middleware
        const Tasks=sequelize.models.Tasks;
        const CommercialOffer= sequelize.models.CommercialOffer;
        // Get the role from the database
        const Offer = sequelize.models.Offer;
        const offers = await Offer.findAll({
            include: [
                {
                    model: sequelize.models.QuotationRequest,
                    attributes: ["id_quotationrequest", "name", "description", "companytype"],
                    include: [
                      { model: sequelize.models.Company, attributes: ["id_company", "name", "companytype"],
                        include: [
                            {
                                model: sequelize.models.ClientType,
                                attributes: ["id_clienttype", "code", "description"],
    
                            },
                            
                        ]
                     },
                     {
                      model: sequelize.models.ProjectType,
                      attributes: ["id_projecttype", "code", "description"],

                  },
                        {
                            model: sequelize.models.Category,
                            attributes: ["id_category", "name"],
                        },
                        {
                            model: sequelize.models.Subcategory,
                            attributes: ["id_subcategory", "name"],
                        },
                        {
                            model: sequelize.models.TechnicalArea,
                            attributes: ["id_technicalarea", "name", "code"],
                        },
                    ],
                },
                 {
                   model: CommercialOffer,
                   attributes: ["id_commercialoffer", "linkedtask", "amount", "date","id_offer"],
                 },
                {
                  model: Tasks,
                  attributes: ["id_task", "name", "hour","description", "percentage", "assignedTo", "estimatedend", "estimatedstart", "client"],
                  include: [
                    {
                      model: sequelize.models.User,
                      as: 'assignedToUser',
                      attributes: ['id_user', 'name', 'surname'],
                    },
                    
                ]
                },
                { model: sequelize.models.User,  as:'team', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }    
            ],
        });

        for (let offer of offers) {
            const creationDate = new Date(offer.updatedAt); // Assum+ing offer.createdAt is a valid date string or a Date object
            const deadlineDate = new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Adding 7 days to the creation date
            const currentDate = new Date(); // Get current date

            // Calculate remaining days
            const timeDifference = deadlineDate.getTime() - currentDate.getTime();
            const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

            // if remaining days is less than 0, set status to "Scaduta"
            if (remainingDays < 0) {
                offer.status = "Scaduta";
            }            

            // Save the changes
            await offer.save();

            // Create a new field in the object
            offer.dataValues.deadlineDate = deadlineDate;
        }

        res.status(200).json({ 
            message: "Offers found",
            offer: offers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Offers not found",
            error: error
        });
    }
});
router.get("/read/:id", async (req, res) => {
    const id = req.params.id; // Estrai l'id dall'URL
    const CommercialOffer= sequelize.models.CommercialOffer;
    const Tasks=sequelize.models.Tasks;
    // Get the role from the database
    const Offer = sequelize.models.Offer;
    try {
      // Ottieni l'offerta specifica tramite ID
      const offer = await sequelize.models.Offer.findOne({
        where: {
          id_offer: id, // Condizione di ricerca per id_offer
        },
        include: [
          {
            model: sequelize.models.QuotationRequest,
            attributes: ["id_quotationrequest", "name", "description"],
            include: [
              {
                model: sequelize.models.Company,
                attributes: ["id_company", "name"],
              },
              {
                model: sequelize.models.Category,
                attributes: ["id_category", "name"],
              },
              {
                model: sequelize.models.Subcategory,
                attributes: ["id_subcategory", "name"],
              },
              {
                model: sequelize.models.TechnicalArea,
                attributes: ["id_technicalarea", "name", "code"],
              },
            ],
          },
          {
            model: CommercialOffer,
            attributes: ["id_commercialoffer", "id_offer", "date", "amount", "linkedtask"],
          },
          {
            model: Tasks,
            attributes: ["id_task", "name", "hour","description", "percentage", "assignedTo", "estimatedend", "estimatedstart", "client"],
          },
          {
            model: sequelize.models.User,
            as: "team",
            attributes: ["id_user", "name", "surname"],
          },
          {
            model: sequelize.models.User,
            as: "createdByUser",
            attributes: ["id_user", "name", "surname"],
          },
          {
            model: sequelize.models.User,
            as: "updatedByUser",
            attributes: ["id_user", "name", "surname"],
          },
          {
            model: sequelize.models.User,
            as: "deletedByUser",
            attributes: ["id_user", "name", "surname"],
          },
        ],
      });
  
      // Se l'offerta non viene trovata
      if (!offer) {
        return res.status(404).json({
          message: "Offerta non trovata",
        });
      }
  
      // Calcolo delle date e stato "Scaduta" (come nella rotta `/read/`)
      const creationDate = new Date(offer.updatedAt);
      const deadlineDate = new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Aggiungi 7 giorni
      const currentDate = new Date();
  
      const timeDifference = deadlineDate.getTime() - currentDate.getTime();
      const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
      if (remainingDays < 0) {
        offer.status = "Scaduta";
      }
  
      // Aggiungi la `deadlineDate` ai dati dell'offerta
      offer.dataValues.deadlineDate = deadlineDate;
  
      // Risposta con i dati dell'offerta
      res.json({
        offer: offer,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Errore interno del server",
      });
    }
  });
  
export default router;
