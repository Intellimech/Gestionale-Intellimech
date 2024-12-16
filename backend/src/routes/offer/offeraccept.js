import express from "express";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/accept/:id", async (req, res) => {
    const Offer = sequelize.models.Offer;
    const SalesOrder = sequelize.models.SalesOrder;
    const user = req.user; // Assuming req.user is populated by the authentication middleware
    let matchingODV= null;
    
        // Find the offer to ensure it exists
        const offer = await Offer.findOne({
            where: { id_offer: req.params.id },
        });

        
        if(offer.name.slice(-1) !=0){

       
        const add= offer.name.slice(-1) -1; 
        console.log(add);
        // Search for an offer with the same base ID but ending with 0
        const name = offer?.name?.slice(0, -1) + add;
       
        const matchingOffer = await Offer.findOne({
            where: { name: name },
        });
        console.log(matchingOffer);

         matchingODV = await SalesOrder.findOne({
            where: { offer: matchingOffer.id_offer },
        });
        console.log(matchingODV);


        if(matchingODV){
            await SalesOrder.update(
                { offer: offer.id_offer },
                { where: { id_salesorder: matchingODV.id_salesorder } }
            );
        }
    }


        // Update the original offer's status to "Approvata"
        await Offer.update(
            { status: "Approvata" },
            { where: { id_offer: req.params.id } }
        );

        if(!matchingODV){
        // Count the existing sales orders to generate a unique name
        const countSalesOrders = await SalesOrder.count();
        const salesOrderName = `ODV${new Date().getFullYear().toString().substr(-2)}_${(countSalesOrders + 1).toString().padStart(5, "0")}`;

        // Create a new SalesOrder associated with the appropriate offer
        const salesOrder = await SalesOrder.create({
            name: salesOrderName,
            offer: offer.id_offer, // Link to the appropriate offer ID
            createdBy: user.id_user, // Use the user ID from req.user
        });
    
        }
});

export default router;
