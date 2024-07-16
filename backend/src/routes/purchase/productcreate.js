import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import sequelize from "../../utils/db.js";
import Product from "../../models/product.js";  
// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

router.post("/create", (req, res) => {
    const { purchase_id, category, subcategory, quantity, unit_price } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!purchase_id || !category || !subcategory || !quantity || !unit_price) {
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
            const newProduct = await Product.create({
                id_purchase : id_purchase,
                category : category,
                subcategory : subcategory,
                quantity : quantity,
                unit_price : unit_price
            });

            res.status(201).json({
                message: "Product created",
                product: newProduct,
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
