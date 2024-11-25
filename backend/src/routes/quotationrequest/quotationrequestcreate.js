import express from "express";
import sequelize from "../../utils/db.js";
import { Mutex } from 'async-mutex';
import { Op } from 'sequelize';

// Setup the express router
const router = express.Router();
const mutex = new Mutex();

// Modelli Sequelize
const Company = sequelize.models.Company;
const ClientType = sequelize.models.ClientType;
const User = sequelize.models.User;
const QuotationRequest = sequelize.models.QuotationRequest;

// Middleware per il parsing del JSON
router.use(express.json());

async function generateQuotationRequestName(transaction) {
  const currentYear = new Date().getFullYear().toString().substr(-2);
  const prefix = `RDO${currentYear}_`;

  // Trova l'ultima richiesta per l'anno corrente
  const lastRequest = await QuotationRequest.findOne({
    where: {
      name: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [['name', 'DESC']],
    transaction, // Usa la transazione per garantire coerenza
  });

  let nextNumber = 1;
  if (lastRequest && lastRequest.name) {
    const lastNumber = parseInt(lastRequest.name.split('_')[1], 10);
    nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
}

async function createSingleQuotationRequest(companyId, requestData, user) {
  // Inizia una transazione
  const transaction = await sequelize.transaction();
  try {
    const { description, externalcode, assignment, projecttype, technicalarea } = requestData;

    // Fetch dati azienda
    const companyData = await Company.findOne({
      where: { id_company: companyId },
      include: [{
        model: ClientType,
        attributes: ["id_clienttype", "code", "description"],
      }],
      transaction, // Include la transazione
    });

    if (!companyData) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    // Genera un nome univoco usando la transazione
    const requestName = await generateQuotationRequestName(transaction);

    // Crea la richiesta di preventivo
    const newRequest = await QuotationRequest.create({
      name: requestName,
      description,
      technicalarea,
      projecttype,
      externalcode: externalcode || "",
      assignment: assignment,
      company: companyData.id_company,
      companytype: companyData?.ClientType?.code || "",
      createdBy: user.id_user,
      status: "In Attesa",
    }, { transaction });

    // Conferma la transazione
    await transaction.commit();
    return newRequest;
  } catch (error) {
    // Rollback in caso di errore
    await transaction.rollback();
    throw error;
  }
}

router.post("/create/", async (req, res) => {
  try {
    const {
      description,
      externalcode,
      assignment,
      projecttype,
      technicalarea,
      companies,
    } = req.body;

    const user = req.user;

    const requiredFields = {
      description,
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

    const createdRequests = [];
    for (const companyId of companies) {
      await mutex.runExclusive(async () => {
        const quotationRequest = await createSingleQuotationRequest(
          companyId,
          { description, externalcode, assignment, projecttype, technicalarea },
          user
        );
        createdRequests.push(quotationRequest);
      });
    }
    

    res.status(200).json({
      message: "Quotation Requests created successfully",
      quotationRequests: createdRequests,
    });
  } catch (error) {
    console.error("Error creating Quotation Requests:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});


export default router;