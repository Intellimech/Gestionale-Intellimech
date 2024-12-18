import express from "express";
import sequelize from "../../utils/db.js";

const router = express.Router();

// Helper function to extract all reportings
const extractAllReportings = (salesOrders) => {
    const allReportings = [];
    
    salesOrders.forEach((salesOrder) => {
        salesOrder.Offer?.Tasks?.forEach((task) => {
            // Extract reportings from main tasks
            task.taskReportings?.forEach((reporting) => {
                allReportings.push({
                    ...reporting.toJSON(),
                    createdByUser: reporting.createdByUser
                        ? {
                              id_user: reporting.createdByUser.id_user,
                              name: reporting.createdByUser.name,
                              surname: reporting.createdByUser.surname,
                          }
                        : null,
                    associatedTask: reporting.associatedTask
                        ? {
                              id_task: reporting.associatedTask.id_task,
                              name: reporting.associatedTask.name,
                              description: reporting.associatedTask.description,
                          }
                        : null,
                });
            });

            // Extract reportings from subtasks
            task.Tasks?.forEach((subTask) => {
                subTask.taskReportings?.forEach((reporting) => {
                    allReportings.push({
                        ...reporting.toJSON(),
                        createdByUser: reporting.createdByUser
                            ? {
                                  id_user: reporting.createdByUser.id_user,
                                  name: reporting.createdByUser.name,
                                  surname: reporting.createdByUser.surname,
                              }
                            : null,
                        associatedTask: reporting.associatedTask
                            ? {
                                  id_task: reporting.associatedTask.id_task,
                                  name: reporting.associatedTask.name,
                                  description: reporting.associatedTask.description,
                              }
                            : null,
                    });
                });
            });
        });
    });

    return allReportings;
};

// Function to get the reporting date range
const getReportingDateRange = (salesOrder) => {
    // Collect all reporting dates
    const reportingDates = [];

    // Traverse through tasks and subtasks to collect all reporting dates
    salesOrder.Offer?.Tasks?.forEach((task) => {
        // Check main task reportings
        task.taskReportings?.forEach((reporting) => {
            if (reporting.date) {
                reportingDates.push(new Date(reporting.date));
            }
        });

        // Check subtasks reportings
        task.Tasks?.forEach((subTask) => {
            subTask.taskReportings?.forEach((reporting) => {
                if (reporting.date) {
                    reportingDates.push(new Date(reporting.date));
                }
            });
        });
    });

    // If no dates found, return null for both
    if (reportingDates.length === 0) {
        return {
            earliestReportingDate: null,
            latestReportingDate: null
        };
    }

    // Return the earliest and latest dates
    return {
        earliestReportingDate: new Date(Math.min(...reportingDates)),
        latestReportingDate: new Date(Math.max(...reportingDates))
    };
};

// Common include configuration for both routes
const commonIncludes = [
    {
        model: sequelize.models.Offer,
        include: [
            {
                model: sequelize.models.QuotationRequest,
                include: [
                    { model: sequelize.models.Company, attributes: ["id_company", "name"] },
                    { model: sequelize.models.Category, attributes: ["id_category", "name"] },
                    { model: sequelize.models.Subcategory, attributes: ["id_subcategory", "name"] },
                    { model: sequelize.models.Assignment, attributes: ["id_assignment", "code", "description"] },
                    { model: sequelize.models.ProjectType, attributes: ["id_projecttype", "code", "description"] },
                    { model: sequelize.models.TechnicalArea, attributes: ["id_technicalarea", "name", "code"] },
                ],
            },
            {
                model: sequelize.models.Tasks,
                attributes: ["id_task", "name", "description", "percentage"],
                include: [
                    {
                        model: sequelize.models.Reporting,
                        as: "taskReportings",
                        include: [
                            {
                                model: sequelize.models.User,
                                as: "createdByUser",
                                attributes: ["id_user", "name", "surname"],
                            },
                            {
                                model: sequelize.models.Tasks,
                                as: "associatedTask",
                                attributes: ["id_task", "name", "description"],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    { model: sequelize.models.User, as: 'createdByUser', attributes: ['id_user', 'name', 'surname'] },
    { model: sequelize.models.User, as: 'updatedByUser', attributes: ['id_user', 'name', 'surname'] },
    { model: sequelize.models.User, as: 'deletedByUser', attributes: ['id_user', 'name', 'surname'] }
];

// Get all sales orders
router.get("/read/", (req, res) => {
    const SalesOrder = sequelize.models.SalesOrder;

    SalesOrder.findAll({
        include: commonIncludes,
    })
    .then((salesorders) => {
        // Extract all reportings
        const allReportings = extractAllReportings(salesorders);

        // Add date range to each sales order
        const salesordersWithDateRange = salesorders.map(salesorder => ({
            ...salesorder.toJSON(),
            ...getReportingDateRange(salesorder)
        }));

        res.status(200).json({
            salesorders: salesordersWithDateRange,
            allReportings: allReportings
        });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

// Get specific sales order by ID
router.get("/read/:id", (req, res) => {
    const { id } = req.params;
    const SalesOrder = sequelize.models.SalesOrder;

    SalesOrder.findOne({
        where: { id_salesorder: id },
        attributes: ["id_salesorder", "name", "status"],
        include: commonIncludes,
    })
    .then((salesorder) => {
        if (!salesorder) {
            return res.status(404).json({ message: "Sales order not found" });
        }

        // Extract all reportings
        const allReportings = extractAllReportings([salesorder]);

        // Get the reporting date range
        const { earliestReportingDate, latestReportingDate } = getReportingDateRange(salesorder);

        res.status(200).json({
            salesorder: salesorder,
            allReportings: allReportings,
            earliestReportingDate: earliestReportingDate,
            latestReportingDate: latestReportingDate
        });
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;