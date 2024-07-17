import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import sequelize from "../../utils/db.js";
import Purchase from "../../models/purchase.js";
import Product from "../../models/product.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

router.post("/create", (req, res) => {
  const { id_company, payment, products } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!id_company || !products || !Array.isArray(products)) {
    return res.status(400).json({
      message: "Bad request, view documentation for more information",
    });
  }

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

    // Calculate the total price
    const total = products.reduce((sum, product) => {
      return sum + (product.unit_price * product.quantity);
    }, 0);

    try {
      const newPurchase = await Purchase.create({
        id_company: id_company,
        payment: payment,
        IVA: "esclusa",
        total: total, // use the calculated total
        createdBy: "7",
        updatedBy: "7",
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('New Purchase Created:', newPurchase.toJSON());

      const productPromises = products.map(product => {
        const productData = {
          id_purchase: newPurchase.id_purchase,
          category: product.category,
          price: product.unit_price,
          quantity: product.quantity,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log('Creating Product:', productData);
        return Product.create(productData);
      });

      await Promise.all(productPromises);

      res.status(201).json({
        message: "Purchase created",
        purchase: newPurchase,
      });

    } catch (error) {
      console.error('Error creating purchase or products:', error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });
});

export default router;
