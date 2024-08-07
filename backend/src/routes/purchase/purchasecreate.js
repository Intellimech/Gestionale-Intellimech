import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;

router.post("/create", async (req, res) => {
  try {
    const { id_company, products, date, payment, currency } = req.body;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    if (!id_company || !products || !date) {
      return res.status(400).json({
        message: "Bad request, view documentation for more information",
      });
    }

    // Count distinct purchases to generate a unique name
    const purchaseCount = await Purchase.count({ distinct: "name" });

    // Generate a unique purchase name
    let namePurchase = `ODA${new Date().getFullYear().toString().substr(-2)}_${(purchaseCount + 1).toString().padStart(5, "0")}`;

    // Sum all the prices of the products
    products.forEach((product) => {
      product.total = product.unit_price * product.quantity;
    });

    // Calculate the total price of the purchase
    const purchaseTotal = products.reduce((acc, product) => acc + product.total, 0);

    // Create the purchase entry
    const purchase = await Purchase.create({
      id_company: id_company,
      name: namePurchase,
      payment_method: payment,
      date: date,
      currency: currency,
      total: purchaseTotal,
      createdBy: user.id_user,  // Use user ID from req.user
    });

    const purchaseId = purchase.id_purchase;

    // Create the associated purchase rows
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let PurchaseRowName = `${namePurchase}_${(i + 1) * 10}`;

      await PurchaseRow.create({
        id_purchase: purchaseId,
        name: PurchaseRowName,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        unit_price: product.unit_price,
        quantity: product.quantity,
        totalprice: product.total,
      });
    }

    res.status(201).json({
      message: "Purchase created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
