import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

// Modelli Sequelize
const Company = sequelize.models.Company;
const ClientType = sequelize.models.ClientType; // Correzione: "ClintType" in "ClientType"
const User = sequelize.models.User;
const QuotationRequest = sequelize.models.QuotationRequest;

// Middleware per il parsing del JSON
router.use(express.json());router.post("/create/", async (req, res) => {
  try {
    const {
      description,
      externalcode,
      assignment,
      projecttype,
      technicalarea,
      companies, // Lista di aziende
    } = req.body;

    const user = req.user;

    // Validazione dei campi obbligatori
    const requiredFields = {
      description,
      assignment,
      projecttype,
      technicalarea,
      companies,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!Array.isArray(companies)) {
      return res.status(400).json({
        message: "Companies field must be an array of company IDs",
      });
    }

    // Otteniamo l'ultimo contatore sequenziale esistente
    const lastRequest = await QuotationRequest.findOne({
      order: [["createdAt", "DESC"]],
    });

    let baseSequentialCount = lastRequest
      ? parseInt(lastRequest.name.split("_")[1]) // Estrae l'ultimo numero sequenziale
      : 0;

    const createdRequests = [];

    for (const companyId of companies) {
      // Fetch dati azienda
      const companyData = await Company.findOne({
        where: { id_company: companyId },
        include: [
          {
            model: ClientType,
            attributes: ["id_clienttype", "code", "description"],
          },
        ],
      });

      if (!companyData) {
        return res.status(404).json({
          message: `Company with ID ${companyId} not found`,
        });
      }

      // Incrementa il contatore locale
      baseSequentialCount++;

      // Genera un nome univoco
      const currentYear = new Date().getFullYear().toString().substr(-2);
      const requestName = `RDO${currentYear}_${baseSequentialCount.toString().padStart(5, "0")}`;

      // Crea la richiesta di offerta
      const quotationRequest = await QuotationRequest.create({
        name: requestName,
        description,
        technicalarea,
        projecttype,
        externalcode: externalcode || "",
        assignment,
        company: companyData.id_company,
        companytype: companyData?.ClientType?.code || "",
        createdBy: user.id_user,
        status: "In Attesa",
      });

      createdRequests.push(quotationRequest);
    }

    res.status(200).json({
      message: "Quotation Requests created successfully",
      quotationRequests: createdRequests,
    });
  } catch (error) {
    console.error("Error creating Quotation Requests:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});


export default router;
