import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const   router = express.Router();

const Contract = sequelize.models.Contract;
const ContractRow = sequelize.models.ContractRow;

router.post("/create", async (req, res) => {
  try {
    const { id_company, products, date_start, date_end, payment, currency } = req.body;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    if (!id_company || !products || !date_start || !date_end) {
      return res.status(400).json({
        message: "Bad request, missing required fields",
      });
    }

    // Count distinct contracts to generate a unique name
    const contractCount = await Contract.count({ distinct: "name" });

    // Generate a unique contract name
    let nameContract = `ODA${new Date().getFullYear().toString().substr(-2)}_${(contractCount + 1).toString().padStart(5, "0")}_R0`;

    // Process products and calculate totals
    products.forEach((product) => {
      // Calculate unit price with VAT
      const vatRate = parseFloat(product.vat) / 100 || 0;
      const unitPriceWithVat = product.unit_price * (1 + vatRate);
      
      product.unit_price_vat = unitPriceWithVat;
      product.total_price = product.unit_price * product.quantity;
      product.total_price_vat = unitPriceWithVat * product.quantity;
    });

    // Calculate the total price of the contract
    const contractTotal = products.reduce((acc, product) => acc + product.total_price, 0);

    // Create the contract entry
    const contract = await Contract.create({
      id_company: id_company,
      name: nameContract,
      payment_method: payment,
      date_start: date_start,
      date_end: date_end,
      currency: currency,
      total: contractTotal,
      createdBy: user.id_user,  // Use user ID from req.user
    });

    const contractId = contract.id_contract;

    // Create the associated contract rows
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
    
      let increment = (i + 1) * 10;
      let parts = nameContract.split("_");
      let ContractRowName = `${parts[0]}_${parts[1]}_${increment}_${parts[2]}`;

      await ContractRow.create({
        id_contract: contractId,
        name: ContractRowName,
        description: product.description,
        unit_price: product.unit_price,
        unit_price_vat: product.unit_price_vat,
        quantity: product.quantity,
        vat: parseFloat(product.vat) || 0,
        total_price: product.total_price,
        total_price_vat: product.total_price_vat
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