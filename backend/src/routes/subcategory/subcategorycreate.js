import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sequelize from '../../utils/db.js'; // Ensure the path is correct
import Logger from '../../utils/logger.js'; // Ensure the path is correct

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());

// Route to handle subcategory creation
router.post('/create', async (req, res) => {
  try {
    const { name, category } = req.body;

    // Validate input
    if (!name || !category) {
      return res.status(400).json({
        message: 'Both name and category are required',
      });
    }

    // Ensure the Subcategory model is loaded
    const Subcategory = sequelize.models.Subcategory;
    if (!Subcategory) {
      throw new Error('Subcategory model is not loaded');
    }

    // Create subcategory
    const subcategory = await Subcategory.create({
      name,
      category,
    });

    res.status(201).json({
      message: 'Subcategory created successfully',
      subcategory,
    });
  } catch (error) {
    Logger("error",error);

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

export default router;


// router.get("/create/", (req, res) => {
//     // Get the role from the database
//     const QuotationRequest = sequelize.models.QuotationRequest;

//     QuotationRequest.create({
//         name: req.body.name,
//         description: req.body.description,
//         category: req.body.category,
//         subcategory: req.body.subcategory,
//         technicalarea: req.body.technicalarea,
//         status: req.body.status,
//         company: req.body.company,
//     })
//     .then((quotationrequest) => {
//         res.status(200).json({
//             message: "Quotation Request created",
//             quotationrequest: quotationrequest,
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//             message: "Internal server error",
//         });
//     });
// });