import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/create", async (req, res) => {
  let { amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks, commercialoffers } = req.body;
  const user = req.user;

  console.log("Received data:", { amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks, commercialoffers });

  if (isNaN(Date.parse(estimatedstart)) || isNaN(Date.parse(estimatedend))) {
    return res.status(400).json({
      message: "Invalid date format for estimatedstart or estimatedend",
    });
  }

  const Offer = sequelize.models.Offer;
  const Tasks = sequelize.models.Tasks;
  const CommercialOffer = sequelize.models.CommercialOffer;
  const QuotationRequest = sequelize.models.QuotationRequest;

  try {
    const quotationData = await QuotationRequest.findOne({
      where: {
        id_quotationrequest: quotationrequest,
      },
    });

    if (!quotationData) {
      return res.status(404).json({ message: "Quotation request not found" });
    }

    const percentage = quotationData.percentage;

    const offerCount = await Offer.count();
    const offerName = `OFF${new Date().getFullYear().toString().substr(-2)}_${(offerCount + 1).toString().padStart(5, "0")}_R0`;

    const offer = await Offer.create({
      name: offerName,
      amount: amount,
      hour: hour,
      estimatedstart: new Date(estimatedstart),
      estimatedend: new Date(estimatedend),
      quotationrequest: quotationrequest,
      createdBy: user.id_user,
    });

    await offer.addTeam(team);

    // Mappa per tenere traccia delle task create e dei loro nomi
    const taskMap = new Map();

    const createTasks = async (parentId, tasks, parentPrefix = "") => {
      let taskCounter = 1;

      for (const task of tasks) {
        const taskName = parentPrefix 
          ? `${parentPrefix}.${taskCounter}`
          : taskCounter.toString();

          const newTask = await Tasks.create({
            name: taskName,
            hour: task?.hours,
            value: task.value || 0,
            estimatedstart: new Date(task?.estimatedstart),
            estimatedend: new Date(task?.estimatedend),
            description: task.description,
            percentage: percentage || 0,
            assignedTo: task.assignedTo || null,
            parentTask: parentId || null,
          createdBy: user.id_user,
          id_offer: offer.id_offer
        });

        // Salva l'id della task e il suo nome nella mappa
        taskMap.set(newTask.id_task, taskName);

        if (task.children && task.children.length > 0) {
          await createTasks(newTask.id_task, task.children, taskName);
        }

        taskCounter++;
      }
    };

    await createTasks(null, tasks);

    const createCommercialOffers = async (offers) => {
      for (const offerData of offers) {
        // Se c'è una task collegata, recupera il suo nome dalla mappa
        const taskName = offerData.linkedTask ? taskMap.get(offerData.linkedTask) : null;

        await CommercialOffer.create({
          linkedTask: offerData?.linkedTask || "Accettazione dell'offerta",
          taskName: taskName, // Aggiungi il nome della task collegata
          date: new Date(offerData.date),
          amount: offerData.amount || 0,
          id_offer: offer.id_offer
        });
      }
    };

    if (commercialoffers && commercialoffers.length > 0) {
      await createCommercialOffers(commercialoffers);
    }

    res.status(200).json({
      message: "Offer created with tasks and commercial offers",
      offer: offer,
    });
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/create/rev", async (req, res) => {
    let { amount, hour, estimatedstart, name, revision, estimatedend, quotationrequest, team, tasks, commercialoffers } = req.body;
    const user = req.user;
  
    console.log("Received data:", { name, amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks, commercialoffers });
  
  
  
    const Offer = sequelize.models.Offer;
    const Tasks = sequelize.models.Tasks;
    const CommercialOffer = sequelize.models.CommercialOffer;
    const QuotationRequest = sequelize.models.QuotationRequest;
  
    try {
      const quotationData = await QuotationRequest.findOne({
        where: {
          id_quotationrequest: quotationrequest,
        },
      });
  
      if (!quotationData) {
        return res.status(404).json({ message: "Quotation request not found" });
      }
  
      const percentage = quotationData.percentage;
  
    let trimmedName = name ? name.slice(0, -2) : ''; 

    let offerName = `${trimmedName}_R${revision}`;

  
      const offer = await Offer.create({
        



        name: offerName,
        amount: amount,
        hour: hour,
        estimatedstart: new Date(estimatedstart),
        estimatedend: new Date(estimatedend),
        quotationrequest: quotationrequest,
        createdBy: user.id_user,
      });
  
      await offer.addTeam(team);
  
      // Mappa per tenere traccia delle task create e dei loro nomi
      const taskMap = new Map();
  
      const createTasks = async (parentId, tasks, parentPrefix = "") => {
        let taskCounter = 1;
  
        for (const task of tasks) {
          const taskName = parentPrefix 
            ? `${parentPrefix}.${taskCounter}`
            : taskCounter.toString();
  
          const newTask = await Tasks.create({
            name: taskName,
            hour: task?.hour,
            value: task.value || 0,
            estimatedstart: new Date(task?.estimatedstart),
            estimatedend: new Date(task?.estimatedend),
            description: task.description,
            percentage: percentage || 0,
            assignedTo: task.assignedTo || 2,
            parentTask: parentId || null,
            createdBy: user.id_user,
            id_offer: offer.id_offer
          });
  
          // Salva l'id della task e il suo nome nella mappa
          taskMap.set(newTask.id_task, taskName);
  
          if (task.children && task.children.length > 0) {
            await createTasks(newTask.id_task, task.children, taskName);
          }
  
          taskCounter++;
        }
      };
  
      await createTasks(null, tasks);
  
      const createCommercialOffers = async (offers) => {
        for (const offerData of offers) {
          // Se c'è una task collegata, recupera il suo nome dalla mappa
          const taskName = offerData.linkedTask ? taskMap.get(offerData.linkedTask) : null;
  
          await CommercialOffer.create({
            linkedTask: offerData?.linkedTask || "Accettazione dell'offerta",
            taskName: taskName, // Aggiungi il nome della task collegata
            date: new Date(offerData.date),
            amount: offerData.amount || 0,
            id_offer: offer.id_offer
          });
        }
      };
  
      if (commercialoffers && commercialoffers.length > 0) {
        await createCommercialOffers(commercialoffers);
      }
  
      res.status(200).json({
        message: "Offer created with tasks and commercial offers",
        offer: offer,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  });
  
router.post('/updaterev', async (req, res) => {
  
  let { id } = req.body;
    const Offer = sequelize.models.Offer;
    
    console.log("Updating offer with ID:", id);
    console.log("Request body:", req.body);  // Added this log
    
    try {
      const result = await Offer.update(
        { status: "Annullata" },
        { where: { id_offer: id } }
      );
      
      console.log("Update result:", result);  // Added this log
      
   
      
      res.status(200).json({
        message: 'Offerta annullata con successo'
      });
      
    } catch (error) {
      console.error('Error canceling offer:', error);
      res.status(500).json({
        message: 'Errore durante l\'annullamento dell\'offerta',
        error: error.message
      });
    }
  });
export default router;
