import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sequelize from "../../utils/db.js";
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

// Route per leggere tutte le richieste di offerta
router.get("/read/", async (req, res) => {
  try {
    // Fetch all quotation requests joined with company, category, subcategory, technical area, and user
    const quotationrequest = await QuotationRequest.findAll({
      include: [
        {
          model: Company,
          attributes: ["id_company", "name", "companytype"],
          include: [
            {
              model: sequelize.models.ClientType,
              attributes: ["id_clienttype", "code", "description"],
            },
          ],
        },
        { model: Category, attributes: ["id_category", "name"] },
        { model: Subcategory, attributes: ["id_subcategory", "name"] },
        { model: Assignment, attributes: ["id_assignment", "code", "description"] },
        { model: ProjectType, attributes: ["id_projecttype", "code", "description"] },
        { model: TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
        { model: User, as: "createdByUser", attributes: ["id_user", "name", "surname"] },
        { model: User, as: "updatedByUser", attributes: ["id_user", "name", "surname"] },
        { model: User, as: "deletedByUser", attributes: ["id_user", "name", "surname"] },
      ],
    });

    // Formatta il nome della compagnia
    const formattedQuotationRequest = quotationrequest.map((qr) => {
      if (qr.Company && qr.Company.name) {
        qr.Company.name = qr.Company.name
      }
      return qr;
    });

    res.status(200).json({
      message: "Quotation Requests found",
      quotationrequest: formattedQuotationRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// New route to get a specific quotation request by ID
router.get("/read/:id", async (req, res) => {
  const id = req.params.id; // Estrai l'ID dai parametri della rotta

  try {
    // Trova la richiesta di offerta tramite l'ID
    const quotationrequest = await QuotationRequest.findOne({
      where: { id_quotationrequest: id }, // Ricerca tramite ID
      include: [
        { model: Company, attributes: ["id_company", "name"] },
        { model: Category, attributes: ["id_category", "name"] },
        { model: Subcategory, attributes: ["id_subcategory", "name"] },
        { model: Assignment, attributes: ["id_assignment", "code", "description"] },
        { model: ProjectType, attributes: ["id_projecttype", "code", "description"] },
        { model: TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
        { model: User, as: "createdByUser", attributes: ["id_user", "name", "surname"] },
        { model: User, as: "updatedByUser", attributes: ["id_user", "name", "surname"] },
        { model: User, as: "deletedByUser", attributes: ["id_user", "name", "surname"] },
      ],
    });

    // Controlla se la richiesta di offerta esiste
    if (!quotationrequest) {
      return res.status(404).json({ message: "Quotation Request not found" });
    }

    // Formatta il nome della compagnia
    if (quotationrequest.Company && quotationrequest.Company.name) {
      quotationrequest.Company.name = quotationrequest.Company.name;  // Formatta il nome della compagnia
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
