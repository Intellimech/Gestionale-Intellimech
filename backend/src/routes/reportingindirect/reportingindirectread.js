import express from 'express';
import sequelize from '../../utils/db.js';
import ReportingIndirect from '../../models/reportingindirect.js';

const router = express.Router();

router.get('/read/', async (req, res) => {
  try {
    // Fetch all records with plain data
    const reportingindirectdata = await ReportingIndirect.findAll({ raw: true });

    // Organize tasks into a hierarchy
    const response = organizeTaskHierarchy(reportingindirectdata);

    res.status(200).json({
      message: 'Reporting Indirect found',
      reportingindirect: response,
    });
  } catch (error) {
    console.error('Error fetching Reporting Indirect:', error);
    res.status(500).json({
      message: 'Error fetching Reporting Indirect',
      error: error.message,
    });
  }
});

/**
 * Organizes tasks into a hierarchical structure based on the parentIndirect field
 * @param {Array} tasks - Flat array of tasks
 * @returns {Array} Hierarchical task structure
 */
function organizeTaskHierarchy(tasks) {
  // Create a map of tasks by their ID for quick lookup
  const taskMap = new Map(
    tasks.map((task) => [
      task.id_reportingindirect,
      { ...task, children: [] },
    ])
  );

  // Root-level tasks (tasks without a parent)
  const rootTasks = [];

  // Organize tasks into their hierarchy
  for (const task of taskMap.values()) {
    if (!task.parentIndirect) {
      // This is a root-level task
      rootTasks.push(task);
    } else {
      // Find the parent task and add this as its child
      const parentTask = taskMap.get(task.parentIndirect);
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
  return tasks
    .map((task) => ({
      ...task,
      // Sort children by name or any other criteria
      children: task.children
        ? sortTaskHierarchy(task.children.sort((a, b) => a.name.localeCompare(b.name)))
        : [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default router;
