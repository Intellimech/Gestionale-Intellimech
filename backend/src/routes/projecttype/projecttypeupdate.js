import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import sequelize from "../../utils/db.js";

const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;

const __dirname = path.resolve();
const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

router.put("/update", async (req, res) => {
  const user = req.user; // Assuming req.user is populated by the authentication middleware
  const { id_purchase, id_company, payment_method, date, currency, status, products } = req.body;

  try {
    if (!id_purchase) {
      return res.status(400).json({ message: "Purchase ID is required" });
    }

    // Find the purchase record
    const purchase = await Purchase.findByPk(id_purchase);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Update only the fields that are provided
    const updatedPurchase = {
      id_company: id_company || purchase.id_company,
      payment_method: payment_method || purchase.payment_method,
      date: date || purchase.date,
      currency: currency || purchase.currency,
      status: status || purchase.status,
      updatedBy: user.id_user,
      updatedAt: new Date(),
    };

    // Only update if values have changed
    Object.keys(updatedPurchase).forEach(key => {
      if (updatedPurchase[key] === purchase[key]) {
        delete updatedPurchase[key]; // Don't update the fields if they're the same
      }
    });

    await purchase.update(updatedPurchase); // Update the purchase record with provided changes

    // Update PurchaseRow items if products are provided
    if (products) {
      for (const product of products) {
        if (product.id_purchaserow) {
          const productData = {
            name: product.name,
            description: product.description,
            category: product.category,
            subcategory: product.subcategory,
            subsubcategory: product.subsubcategory,
            unit_price: product.unit_price,
            quantity: product.quantity,
            vat: product.vat,
            taxed_unit_price: product.taxed_unit_price,
            taxed_totalprice: product.taxed_totalprice,
            totalprice: product.totalprice,
          };

          // Update PurchaseRow if id_purchaserow exists
          await PurchaseRow.update(productData, {
            where: { id_purchaserow: product.id_purchaserow },
          });
        } else {
          // Otherwise, create a new PurchaseRow
          await PurchaseRow.create({
            id_purchase,
            name: product.name,
            description: product.description,
            category: product.category,
            subcategory: product.subcategory,
            subsubcategory: product.subsubcategory|| 0,
            unit_price: product.unit_price,
            vat: product.vat,
            taxed_unit_price: product.taxed_unit_price,
            taxed_totalprice: product.taxed_totalprice,
            quantity: product.quantity,
            totalprice: product.totalprice,
          });
        }
      }
    }

    res.status(200).json({ message: "Purchase updated successfully" });
  } catch (error) {
    console.error("Error:", productData); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;
