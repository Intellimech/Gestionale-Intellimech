import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const   router = express.Router();

const Contract = sequelize.models.Contract;
const ContractRow = sequelize.models.ContractRow;

router.post("/create", async (req, res) => {
  try {
    const { 
      id_company,
      total,
      payment_method,
      currency,
      recurrence,
      contract_start_date,
      contract_end_date,
      IVA 
    } = req.body;
    
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    // Validate required fields
    if (!id_company || !total || !contract_start_date || !contract_end_date || !recurrence) {
      
      console.log(req.body);
      return res.status(400).json({
        message: "Bad request: missing required fields. Please check documentation.",
      });
    }

    // Validate recurrence value
    const validRecurrences = ['monthly', 'yearly', 'quarterly', 'biannual'];
    if (!validRecurrences.includes(recurrence)) {
      
      console.log('invalid recurrence value');
      return res.status(400).json({
        message: "Invalid recurrence value. Must be one of: monthly, yearly, quarterly, biannual",
      });
    }

    // Validate dates
    const startDate = new Date(contract_start_date);
    const endDate = new Date(contract_end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Contract end date must be after start date",
      });
    }

    // Count distinct contracts to generate a unique name
    const contractCount = await Contract.count({ distinct: "name" });

    // Generate a unique contract name
    let contractName = `CON${new Date().getFullYear().toString().substr(-2)}_${(contractCount + 1).toString().padStart(5, "0")}`;

    // Create the contract entry
    const contract = await Contract.create({
      id_company,
      name: contractName,
      total,
      payment_method,
      currency,
      IVA,
      recurrence,
      contract_start_date: startDate,
      contract_end_date: endDate,
      status: "In Approvazione",
      createdBy: user.id_user,
    });

    const contractId = contract.id_contract;

    res.status(201).json({
      message: "Contract created successfully",
      contract_id: contractId,
      contract_name: contractName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

// Helper function to calculate months between two dates
function getMonthsBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + 
         (end.getMonth() - start.getMonth()) + 1;
}

export default router;