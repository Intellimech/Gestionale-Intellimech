import express from "express";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/accept/:id", async (req, res) => {
    const Offer = sequelize.models.Offer;
    const SalesOrder = sequelize.models.SalesOrder;
    const user = req.user; // Assuming req.user is populated by the authentication middleware

    try {
        // Find the offer to ensure it exists
        const offer = await Offer.findOne({
            where: { id_offer: req.params.id },
        });

        if (!offer) {
            return res.status(404).json({
                message: "Offer not found",
            });
        }

        // Update the offer's status to "Approvata"
        await Offer.update(
            { status: "Approvata" },
            { where: { id_offer: req.params.id } }
        );

        // Count the existing sales orders to generate a unique name
        const countSalesOrders = await SalesOrder.count();
        const salesOrderName = `ODV${new Date().getFullYear().toString().substr(-2)}_${(countSalesOrders + 1).toString().padStart(5, "0")}`;

        // Create a new SalesOrder associated with the offer
        const salesOrder = await SalesOrder.create({
            name: salesOrderName,
            offer: offer.id_offer,
            createdBy: user.id_user, // Use the user ID from req.user
        });

        res.status(200).json({
            message: "Offer approved",
            offer: offer,
            salesOrder: salesOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
