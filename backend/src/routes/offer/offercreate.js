import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/create/", async (req, res) => {
    let { amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks } = req.body;
    const user = req.user;

    console.log("Received data:", { amount, hour, estimatedstart, estimatedend, quotationrequest, team, tasks });

    if (!amount || !hour || !estimatedstart || !estimatedend || !quotationrequest || !team || !tasks) {
        return res.status(400).json({
            message: "Bad request, view documentation for more information",
        });
    }

    // Ensure the date is valid
    if (isNaN(Date.parse(estimatedstart)) || isNaN(Date.parse(estimatedend))) {
        return res.status(400).json({
            message: "Invalid date format for estimatedstart or estimatedend",
        });
    }

    const Offer = sequelize.models.Offer;
    const Tasks = sequelize.models.Tasks; 
    const QuotationRequest = sequelize.models.QuotationRequest; // Access the QuotationRequest model

    try {
        // Fetch the quotation request to get additional data
        const quotationData = await QuotationRequest.findOne({
            where: {
                id_quotationrequest: quotationrequest, // Ensure this matches the ID sent in the request
            },
        });

        // Log the quotation data
        console.log("Fetched quotation data:", quotationData ? quotationData.toJSON() : "Quotation request not found");

        if (!quotationData) {
            return res.status(404).json({ message: "Quotation request not found" });
        }

        // Use data from quotationData as needed
        const percentage = quotationData.percentage; // Assuming this field exists

        // Create the offer
        const offer = await Offer.create({
            amount: amount,
            hour: hour,
            estimatedstart: new Date(estimatedstart),
            estimatedend: new Date(estimatedend),
            quotationrequest: quotationrequest,
            createdBy: user.id_user,
        });

        // Associate teams with the offer
        await offer.addTeam(team);

        // Function to create tasks
        const createTasks = async (parentId, tasks) => {
            for (const task of tasks) {
                const newTask = await Tasks.create({
                    name: task.name,
                    hour: task.hour || 0,
                    description: task.description || '',
                    percentage: percentage || 0, // Use fetched percentage
                    assignedTo: task.assignedTo?.value || null,
                    parentTask: parentId || null,
                    createdBy: user.id_user,
                });

                // Create child tasks recursively
                if (task.children && task.children.length > 0) {
                    await createTasks(newTask.id_task, task.children);
                }
            }
        };

        // Create tasks
        await createTasks(null, tasks);

        res.status(200).json({
            message: "Offer created with tasks",
            offer: offer,
        });
    } catch (err) {
        console.error("Error creating offer:", err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
