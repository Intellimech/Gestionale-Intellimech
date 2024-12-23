import express from "express";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/accept/:id", async (req, res) => {
    const Contract = sequelize.models.Contract;
    const user = req.user; // Assuming req.user is populated by the authentication middleware
  
    
        // Find the contract to ensure it exists
        const contract = await Contract.findOne({
            where: { id_contract: req.params.id },
        });

        


        // Update the original contract's status to "Approvata"
        await Contract.update(
            { status: "Approvato" },
            { where: { id_contract: req.params.id } }
        );

    
    
});

export default router;
