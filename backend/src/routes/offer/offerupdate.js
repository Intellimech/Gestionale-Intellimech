import express from "express";
import sequelize from "../../utils/db.js";
import { existsSync } from "fs";

const router = express.Router();
router.post('/update', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      id_offer,
      name,
      revision,
      amount,
      hour,
      estimatedstart,
      estimatedend,
      quotationrequest,
      team,
      description,
      quotationrequestdescription,
      tasks,
      commercialoffers
    } = req.body;

    const user = req.user;

    const Offer = sequelize.models.Offer;
    const Tasks = sequelize.models.Tasks;
    const CommercialOffer = sequelize.models.CommercialOffer;
    const QuotationRequest = sequelize.models.QuotationRequest;

    // Trova l'offerta esistente
    const existingOffer = await Offer.findByPk(id_offer, { transaction });

    if (!existingOffer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Offerta non trovata' });
    }

    // Elimina i task esistenti
    await Tasks.destroy({
      where: { id_offer: id_offer },
      transaction
    });

    // Elimina le commercial offers esistenti
    await CommercialOffer.destroy({
      where: { id_offer: id_offer },
      transaction
    });

    // Rimuovi i team esistenti
    await existingOffer.removeTeam(await existingOffer.getTeam(), { transaction });

    // Recupera i dati della richiesta di preventivo
    const quotationData = await QuotationRequest.findOne({
      where: { id_quotationrequest: quotationrequest },
      transaction
    });

    if (!quotationData) {
      await transaction.rollback();
      return res.status(404).json({ message: "Quotation request not found" });
    }

    // Aggiorna l'offerta esistente
    await existingOffer.update({
      amount: amount,
      description: description,
      hour: hour,
      estimatedstart: new Date(estimatedstart),
      estimatedend: new Date(estimatedend),
      quotationrequest: quotationrequest,
      revision: revision || existingOffer.revision
    }, { transaction });

    // Aggiorna la descrizione della richiesta di preventivo
    if (quotationrequestdescription) {
      await QuotationRequest.update(
        { description: quotationrequestdescription },
        { 
          where: { id_quotationrequest: quotationrequest },
          transaction 
        }
      );
    }

    // Aggiungi nuovi team
    if (team && team.length > 0) {
      await existingOffer.addTeam(team, { transaction });
    }

    // Mappa per tenere traccia delle task create
    const taskMap = new Map();

    const createTasks = async (parentId, tasks, parentPrefix = "") => {
      let taskCounter = 1;

      for (const task of tasks) {
        const taskName = parentPrefix 
          ? `${parentPrefix}.${taskCounter}`
          : taskCounter.toString();

        const newTask = await Tasks.create({
          name: taskName,
          hour: task?.hour || task?.hours,
          value: task.value || 0,
          estimatedstart: new Date(task?.estimatedstart),
          estimatedend: new Date(task?.estimatedend),
          description: task.description,
          percentage: quotationData.percentage || 0,
          assignedTo: task.assignedTo || null,
          client: task.client || false,
          parentTask: parentId || null,
          createdBy: user.id_user,
          id_offer: existingOffer.id_offer
        }, { transaction });

        // Salva l'id della task e il suo nome nella mappa
        taskMap.set(newTask.id_task, taskName);

        if (task.children && task.children.length > 0) {
          await createTasks(newTask.id_task, task.children, taskName);
        }

        taskCounter++;
      }
    };

    // Crea nuovi tasks
    await createTasks(null, tasks);

    // Gestione delle commercial offers
    const createCommercialOffers = async (offers) => {
      for (const offerData of offers) {
        // Trova il nome della task collegata
        const taskName = offerData.linkedTask 
          ? taskMap.get(offerData.linkedTask) 
          : "Accettazione dell'offerta";

        await CommercialOffer.create({
          linkedTask: offerData?.linkedTask || "Accettazione dell'offerta",
          taskName: taskName,
          date: new Date(offerData.date),
          amount: offerData.amount || 0,
          id_offer: existingOffer.id_offer
        }, { transaction });
      }
    };

    // Crea nuove commercial offers
    if (commercialoffers && commercialoffers.length > 0) {
      await createCommercialOffers(commercialoffers);
    }

    // Commit della transazione
    await transaction.commit();

    res.status(200).json({
      message: "Offer updated successfully",
      offer: existingOffer
    });

  } catch (err) {
    // Rollback in caso di errore
    await transaction.rollback();
    console.error("Error updating offer:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
});

export default router;