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
    const existingOffer = await Offer.findOne({ where: { name } });
    console.log (existingOffer);
    const id_offer= existingOffer.id_offer;
    console.log("questo è l'id : " + id_offer)


    // Elimina tutte le task e le commercial offer collegate
    await Tasks.destroy({ where: { id_offer: existingOffer.id_offer } });
    await CommercialOffer.destroy({ where: { id_offer: existingOffer.id_offer } });

    // Elimina l'offerta stessa
    await Offer.destroy({ where: { id_offer: existingOffer.id_offer } });

    // Crea una nuova offerta mantenendo lo stesso nome e aggiornando la revisione
    const newOffer = await Offer.create({
      name,  // Mantieni lo stesso nome dell'offerta precedente
      revision,
      amount,
      hour,
      estimatedstart: new Date(estimatedstart),
      estimatedend: new Date(estimatedend),
      quotationrequest,
      createdBy: user.id_user,
    });

    
    try {
      const [updatedRows] = await QuotationRequest.update(
        { description: quotationrequestdescription },
        { where: { id_quotationrequest: quotationrequest } }
      );
    
      console.log("Updating QuotationRequest with ID:", quotationrequest);
      console.log("Number of rows updated:", updatedRows);
    
      if (updatedRows === 0) {
        console.warn("No rows were updated. Check if the ID exists or is valid.");
      }
    } catch (error) {
      console.error("Error during update:", error);
    }

    // Aggiunge il team collegato
    if (team && team.length > 0) {
      await newOffer.addTeam(team);
    }

    // Mappa per tenere traccia delle task create e dei loro nomi
    const taskMap = new Map();

    const recreateTasks = async (parentId, tasks, parentPrefix = "") => {
      let taskCounter = 1;

      for (const task of tasks) {
        const taskName = parentPrefix 
          ? `${parentPrefix}.${taskCounter}`
          : taskCounter.toString();

        const newTask = await Tasks.create({
          name: taskName,
          hour: task.hour,
          value: task.value || 0,
          estimatedstart: new Date(task.estimatedstart),
          estimatedend: new Date(task.estimatedend),
          description: task.description,
          percentage: task.percentage || 0,
          assignedTo: task.assignedTo || 2,
          parentTask: parentId || null,
          createdBy: user.id_user,
          id_offer: newOffer.id_offer,
        });

        // Salva l'id della nuova task nella mappa per collegamenti futuri
        taskMap.set(newTask.id_task, taskName);

        if (task.children && task.children.length > 0) {
          await recreateTasks(newTask.id_task, task.children, taskName);
        }

        taskCounter++;
      }
    };

    await recreateTasks(null, tasks);

    const recreateCommercialOffers = async (offers) => {
      for (const offerData of offers) {
        const taskName = offerData.linkedTask ? taskMap.get(offerData.linkedTask) : null;

        await CommercialOffer.create({
          linkedTask: offerData.linkedTask || "Accettazione dell'offerta",
          taskName,
          date: new Date(offerData.date),
          amount: offerData.amount || 0,
          id_offer: newOffer.id_offer,
        });
      }
    };

    if (commercialoffers && commercialoffers.length > 0) {
      await recreateCommercialOffers(commercialoffers);
    }

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