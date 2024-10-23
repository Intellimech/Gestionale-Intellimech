import express from "express";
import sequelize from "../../utils/db.js";

const router = express.Router();

router.put('/offer/update/:id', async (req, res) => {
    const { id } = req.params;
    
    const Offer = sequelize.models.Offer;
    console.log("SONO IL BACKEND" + id);
    try {
        
 await Offer.update(
        { status: "Annullata" },
        { where: { id_offer: id } }
      );
  
  
      res.status(200).json({
        message: 'Offerta annullata con successo'
      });
  
    } catch (error) {
      Logger.error('Error canceling offer:', error);
      res.status(500).json({
        message: 'Errore durante l\'annullamento dell\'offerta',
        error: error.message
      });
    }
  });

export default router;