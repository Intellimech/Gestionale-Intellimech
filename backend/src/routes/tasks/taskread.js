import express from "express";
import sequelize from "../../utils/db.js";
import { Op } from "sequelize";

const router = express.Router();

router.get("/read/:job", async (req, res) => {
    const { job } = req.params;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    const Job = sequelize.models.Job;

    try {
        const jobdata = await Job.findOne({
            where: { id_job: job },
            include: [
                {
                    model: sequelize.models.SalesOrder,
                    attributes: ["id_salesorder", "name"],
                    include: [
                        {
                            model: sequelize.models.Offer,
                            attributes: ["id_offer", "name", "hour", "amount", "estimatedstart", "estimatedend"],
                            include: [
                                {
                                    model: sequelize.models.Tasks,
                                    // where: { percentage: { [Op.lt]: 100 } }
                                }
                            ],
                        }
                    ],
                }
            ],
        });

        if (!jobdata) {
            return res.status(404).json({
                message: "Job not found",
            });
        }
        
        // Collect all tasks from the job's sales orders and offers
        const allTasks = jobdata.SalesOrders.flatMap((salesorder) => 
            salesorder.Offer ? salesorder.Offer.Tasks : []
        );

        // Organize tasks into a hierarchical structure
        const taskHierarchy = organizeTaskHierarchy(allTasks);
        
        res.status(200).json({
            message: "Job found",
            tasks: taskHierarchy,
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            message: "Error fetching job",
            error: error.message
        });
    }
});

/**
 * Organizes tasks into a hierarchical structure based on the parentTask field
 * @param {Array} tasks - Flat array of tasks
 * @returns {Array} Hierarchical task structure
 */
function organizeTaskHierarchy(tasks) {
    // Create a map of tasks by their ID for quick lookup
    const taskMap = new Map(tasks.map(task => [task.id_task, { 
        ...task.dataValues || task, 
        children: [] 
    }]));

    // Root-level tasks (tasks without a parent)
    const rootTasks = [];

    // Organize tasks into their hierarchy
    for (const task of taskMap.values()) {
        if (!task.parentTask) {
            // This is a root-level task
            rootTasks.push(task);
        } else {
            // Find the parent task and add this as its child
            const parentTask = taskMap.get(task.parentTask);
            if (parentTask) {
                parentTask.children.push(task);
            }
        }
    }

    // Sort root tasks and their children (optional)
    return sortTaskHierarchy(rootTasks);
}

/**
 * Recursively sorts tasks and their children
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
function sortTaskHierarchy(tasks) {
    return tasks.map(task => ({
        ...task,
        // Sort children by name or any other criteria
        children: task.children ? sortTaskHierarchy(task.children.sort((a, b) => 
            a.name.localeCompare(b.name)
        )) : []
    })).sort((a, b) => a.name.localeCompare(b.name));
}

export default router;