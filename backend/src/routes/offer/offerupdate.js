import express from "express";
import sequelize from "../../utils/db.js";
import { existsSync } from "fs";

const router = express.Router();

router.post('/update', async (req, res) => {
  const { name, revision, amount, hour, estimatedstart, estimatedend, quotationrequest, team, quotationrequestdescription, tasks, commercialoffers } = req.body;
  const user = req.user;

  const Offer = sequelize.models.Offer;
  const Tasks = sequelize.models.Tasks;
  const CommercialOffer = sequelize.models.CommercialOffer;
  const QuotationRequest = sequelize.models.QuotationRequest;

  console.log("Updating offer with name and revision:", name);

  try {
    // Cerca l'offerta esistente basandosi su `name` e `revision`
    



    // Trova l'offerta esistente
    const existingOffer = await Offer.findOne({ where: { name } });

        console.log (existingOffer);
        const id_offer= existingOffer.id_offer;
        console.log("questo è l'id : " + id_offer)
    // Aggiorna l'offerta esistente invece di distruggerla
    await existingOffer.update({
      revision: revision,
      amount: amount,
      hour: hour,
      estimatedstart: new Date(estimatedstart),
      estimatedend: new Date(estimatedend),
      // Mantieni altri campi esistenti non modificati
    });
      
    try {
      const [updatedRows] = await QuotationRequest.update(
        { description: quotationrequestdescription },
        { where: { id_quotationrequest: quotationrequest } }
      );
    
      console.log("Updating QuotationRequest with ID:", quotationrequest);
      console.log("Number of rows updated:", updatedRows);
    
    } catch (error) {
      console.error("Error during update:", error);
    }

    // Aggiunge il team collegato
    if (team && team.length > 0) {
      await newOffer.addTeam(team);
    }

    // Mappa per tenere traccia delle task create e dei loro nomi
    const taskMap = new Map();

    // Aggiorna o crea nuovi tasks mantenendo quelli esistenti
    const updateOrCreateTasks = async (tasks, parentId = null) => {
      for (const task of tasks) {
        // Se il task ha un ID, aggiornalo
        if (task.id_task) {
          await Tasks.update({
            hour: task.hour,
            value: task.value,
            description: task.description,
            // altri campi
          }, { where: { id_task: task.id_task } });
        } 
      }
    };

    await recreateTasks(null, tasks);
    const updateOrCreateCommercialOffers = async (offers) => {
      for (const offer of offers) {
        if (offer.id) {
          await CommercialOffer.update({
            amount: offer.amount,
            date: new Date(offer.date)
          }, { where: { id: offer.id } });
        }
      }
    };

  
    res.status(200).json({
      message: 'Offerta annullata e ricreata con successo',
      offer: newOffer,
    });
  } catch (error) {
    console.error('Error recreating offer:', error);
    res.status(500).json({
      message: 'Errore durante la ricreazione dell\'offerta',
      error: error.message,
    });
  }
});



export default router;