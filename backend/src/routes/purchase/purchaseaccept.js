import express from "express";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/accept/:id", async (req, res) => {
    const Purchase = sequelize.models.Purchase;
    const user = req.user; // Assuming req.user is populated by the authentication middleware
  
    
        // Find the purchase to ensure it exists
        const purchase = await Purchase.findOne({
            where: { id_purchase: req.params.id },
        });

        


        // Update the original purchase's status to "Approvata"
        await Purchase.update(
            { status: "Approvato" },
            { where: { id_purchase: req.params.id } }
        );

    
    
});

export default router;
