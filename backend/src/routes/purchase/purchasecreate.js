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

router.post("/create", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  jwt.verify(token, publickey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    try {
      const { id_company, products, date, payment, currency } = req.body;

      if (!id_company || !products || !date) {
        return res.status(400).json({
          message: "Bad request, view documentation for more information",
        });
      }

      const purchaseCount = await Purchase.count({ distinct: "name" });

      let namePurchase = "ODA" + new Date().getFullYear().toString().substr(-2) + "_" + (purchaseCount + 1).toString().padStart(5, "0");
      //sum all the prices of the products
      products.forEach((product) => {
        product.total = product.unit_price * product.quantity;
      });

      var purchaseTotal = products.reduce((acc, product) => acc + product.total, 0);

      const purchase = await Purchase.create({
        id_company: id_company,
        name: namePurchase,
        payment_method: payment,
        date: date,
        currency: currency,
        total: purchaseTotal,
        createdBy: decoded.id,
      });

      const purchaseId = purchase.id_purchase;

      for (const product of products) {
        //make a counter
        let count = 0;
        count++;
        let PurchaseRowName = namePurchase + "_" + (count * 10).toString();
        console.log(PurchaseRowName);
        await PurchaseRow.create({
          id_purchase: purchaseId,
          name: PurchaseRowName,
          category: product.category,
          subcategory: product.subcategory,
          unit_price: product.unit_price,
          quantity: product.quantity,
          totalprice: product.total,
        });
      };

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
}); 


export default router;
