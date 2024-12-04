import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const   router = express.Router();

const Contract = sequelize.models.Contract;
const ContractRow = sequelize.models.ContractRow;

router.post("/create", async (req, res) => {
  try {
    const { id_company, contracts, total, taxed_total, date_start, date_end, payment, currency, recurrence, recurrence_number } = req.body;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    if (!id_company || !contracts || !date_start || !date_end) {
      return res.status(400).json({
        message: "Bad request, missing required fields",
      });
    }

    // Count distinct contracts to generate a unique name
    const contractCount = await Contract.count({ distinct: "name" });

    // Generate a unique contract name
    let nameContract = `CON${new Date().getFullYear().toString().substr(-2)}_${(contractCount + 1).toString().padStart(5, "0")}`;
    // Process contracts and calculate totals
    contracts.forEach((contract) => {
      // Calculate unit price with VAT
      const vatRate = parseFloat(contract.vat) / 100 || 0;
      const unitPriceWithVat = contract.unit_price * (1 + vatRate);
      
      contract.unit_price_vat = unitPriceWithVat;
      contract.total_price = contract.unit_price * contract.quantity;
      contract.total_price_vat = unitPriceWithVat * contract.quantity;
    });

    // Calculate the total price of the contract
    const contractTotal = contracts.reduce((acc, contract) => acc + contract.total_price, 0);

    // Create the contract entry
    const contract = await Contract.create({
      id_company: id_company,
      name: nameContract,
      payment_method: payment,
      contract_start_date: date_start,
      contract_end_date: date_end,
      currency: currency,
      total: total,
      taxed_total: taxed_total,
      recurrence: recurrence,
      recurrence_number: recurrence_number,
      createdBy: user.id_user,  // Use user ID from req.user
    });

    const contractId = contract.id_contract;

    // Create the associated contract rows
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
    
      let increment = (i + 1) * 10;
      let parts = nameContract.split("_");
      let ContractRowName = `${parts[0]}_${parts[1]}_${increment}_${parts[2]}`;

      await ContractRow.create({
        id_contract: contractId,
        name: ContractRowName,
        category: contract.category,
        subcategory: contract.subcategory,
        subsubcategory: contract.subsubcategory || null,
        description: contract.description,
        unit_price: contract.unit_price,
        taxed_unit_price: contract.unit_price_vat,
        totalprice: contract.totalprice,
        taxed_totalprice: contract.taxed_totalprice,
        quantity: contract.quantity,
        vat: parseFloat(contract.vat) || 0,
      });
    }

    res.status(201).json({
      message: "Contract created",
      contract: {
        id: contractId,
        name: nameContract
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

export default router;