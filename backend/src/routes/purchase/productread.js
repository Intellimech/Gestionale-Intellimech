import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import sequelize from "../../utils/db.js";
import Product from "../../models/product.js";  // Assicurati di importare il modello Product

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");

router.get("/read/", (req, res) => {
    const { purchase_id } = req.params;
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
            const products = await Product.findAll({
                where: {
                    purchase_id: purchase_id
                }
            });

            res.status(200).json({
                message: "Products found",
                products: products
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