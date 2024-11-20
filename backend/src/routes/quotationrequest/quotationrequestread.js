import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";
import Assignment from "../../models/assignment.js";
import ProjectType from "../../models/projecttype.js";

// Import models
const QuotationRequest = sequelize.models.QuotationRequest;
const Company = sequelize.models.Company;
const Category = sequelize.models.Category;
const Subcategory = sequelize.models.Subcategory;
const TechnicalArea = sequelize.models.TechnicalArea;
const User = sequelize.models.User;
const Offer = sequelize.models.Offer;

// Setup the express router
const router = express.Router();

// Middleware
router.use(bodyParser.json());
router.use(cors());
// router.get("/read/free", async (req, res) => {
//     const user = req.user;  // Assuming req.user is populated by the authentication middleware
//     const id = req.query.id;  // Retrieve ID from query params (e.g., /read/free?id=123)

//     try {
//         // Se viene passato un ID, cerca solo quella richiesta
//         let whereClause = {};
//         if (id) {
//             whereClause = { id_quotationrequest: id };
//         }

//         // Fetch quotation requests based on whether an ID is provided or not
//         let quotationrequest = await QuotationRequest.findAll({
//             where: whereClause,
//             include: [
//                 { model: Company, attributes: ["id_company", "name"] },
//                 { model: Category, attributes: ["id_category", "name"] },
//                 { model: Subcategory, attributes: ["id_subcategory", "name"] },
//                 { model: TechnicalArea, attributes: ["id_technicalarea", "name"] },
//                 { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
//                 { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
//                 { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }
//             ],
//         });

//         // Filtro per richieste con offerte accettate
//         for (let i = 0; i < quotationrequest.length; i++) {
//             const quotation = quotationrequest[i];

//             const offer = await Offer.findOne({
//                 where: { quotationrequest: quotation.id_quotationrequest },
//             });

//             if (offer && (offer.status === "Nuova" || offer.status === "Inviata al cliente" || offer.status === "Accettata")) {
//                 quotationrequest = quotationrequest.filter((qr) => qr.id_quotationrequest !== quotation.id_quotationrequest);
//             }
//         }

//         res.status(200).json({
//             message: "Quotation Requests found",
//             quotationrequest: quotationrequest,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Internal server error",
//         });
//     }
// });


router.get("/read/", async (req, res) => {
    try {
        // Fetch all quotation requests joined with company, category, subcategory, technical area, and user
        const quotationrequest = await QuotationRequest.findAll({
            include: [
                { model: Company, attributes: ["id_company", "name", "companytype"],
                    include: [
                        {
                            model: sequelize.models.ClientType,
                            attributes: ["id_clienttype", "code", "description"],

                        },
                      
                    ]
                 },
                { model: Category, attributes: ["id_category", "name"] },
                { model: Subcategory, attributes: ["id_subcategory", "name"] },
                { model: Assignment, attributes: ["id_assignment", "code","description"] },
                { model: ProjectType, attributes: ["id_projecttype", "code", "description"] },
                { model: TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }    
            ],
        });

        res.status(200).json({
            message: "Quotation Requests found",
            quotationrequest: quotationrequest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
// New route to get a specific quotation request by ID
router.get("/read/:id", async (req, res) => {
    const id= req.params.id;  // Estrai l'ID dai parametri della rotta

    try {
        // Trova la richiesta di offerta tramite l'ID
        const quotationrequest = await QuotationRequest.findOne({
            where: { id_quotationrequest: id },  // Ricerca tramite ID
            include: [
                { model: Company, attributes: ["id_company", "name"] },
                { model: Category, attributes: ["id_category", "name"] },
                { model: Subcategory, attributes: ["id_subcategory", "name"] },
                { model: Assignment, attributes: ["id_assignment", "code","description"] },
                { model: ProjectType, attributes: ["id_projecttype", "code", "description"] },
                { model: TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
                { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
                { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }
            ],
        });

        // Controlla se la richiesta di offerta esiste
        if (!quotationrequest) {
            return res.status(404).json({ message: "Quotation Request not found" });
        }

        // Rispondi con i dati della richiesta di offerta
        res.status(200).json({
            message: "Quotation Request found",
            quotationrequest: quotationrequest,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
