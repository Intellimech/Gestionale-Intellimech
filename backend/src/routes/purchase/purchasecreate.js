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
 
router.post("/create", async (req, res) => {
    const { azienda, description, iva, payment_method, products } = req.body;
    const token = req.headers.authorization.split(" ")[1];
 
    console.log("Request Body:", req.body); // Add this line
 
    if (!products || !azienda) {
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
 
        try {
            const newPurchase = await Purchase.create({
                azienda,
                description,
                payment_method,
                total: 0, // Total will be calculated later
                createdBy: decoded.id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
 
            let total = 0;
 
            for (const product of products) {
                const newProduct = await Product.create({
                    id_purchase: newPurchase.id_purchase,
                    category: product.category,
                    subcategory: product.subcategory,
                    quantity: product.quantity,
                    unit_price: product.unit_price,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
 
                total += product.quantity * product.unit_price;
            }
 
            newPurchase.total = total;
            await newPurchase.save();
 
            res.status(201).json({
                message: "Purchase order and products created",
                purchase: newPurchase,
            });
        } catch (error) {
            console.error("Error creating purchase order or products:", error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    });
});
 
export default router;