import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");
router.put("/update", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, publickey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      console.log('Request Body:', req.body); // Log della richiesta

      const { id_purchase, id_company, payment_method, date, currency, status, products } = req.body;

      if (!id_purchase) {
        return res.status(400).json({ message: "Purchase ID is required" });
      }

      const purchase = await Purchase.findByPk(id_purchase);

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      purchase.id_company = id_company || purchase.id_company;
      purchase.payment_method = payment_method || purchase.payment_method;
      purchase.date = date || purchase.date;
      purchase.currency = currency || purchase.currency;
      purchase.status = status || purchase.status;
      purchase.updatedBy = decoded.id;
      purchase.updatedAt = new Date();

      await purchase.save();

      if (products) {
        for (const product of products) {
          if (product.id_purchaserow) {
            await PurchaseRow.update(
              {
                name: product.name,
                description: product.description,
                category: product.category,
                subcategory: product.subcategory,
                unit_price: product.unit_price,
                quantity: product.quantity,
                totalprice: product.totalprice,
              },
              { where: { id_purchaserow: product.id_purchaserow } }
            );
          } else {
            await PurchaseRow.create({
              id_purchase: id_purchase,
              name: product.name,
              description: product.description,
              category: product.category,
              subcategory: product.subcategory,
              unit_price: product.unit_price,
              quantity: product.quantity,
              totalprice: product.totalprice,
            });
          }
        }
      }

      res.status(200).json({ message: "Purchase updated" });
    } catch (error) {
      console.error('Error:', error); // Log dell'errore
      res.status(500).json({ message: "Internal server error" });
    }
  });
});


export default router;
