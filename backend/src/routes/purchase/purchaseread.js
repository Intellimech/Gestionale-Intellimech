import express from 'express';
import sequelize from '../../utils/db.js';

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;
const Company = sequelize.models.Company;

router.get('/read', async (req, res) => {
  try {
    // Get all the purchases
    const purchases = await Purchase.findAll({
      include: [
        {
          model: PurchaseRow,
          attributes: ["id_purchaserow", "name", "description", "depreciation", "depreciation_years", "asset", "category", "subcategory", "unit_price", "quantity", "vat", "totalprice", "taxed_unit_price", "taxed_totalprice"],
          include: [
            {
              model: sequelize.models.Category,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name"],
            },
          ]
        },
        {
          model: Company,
          attributes: ["id_company", "name"],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
        }
      ],
    });

    res.json({
      purchases: purchases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

router.get('/read/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Get the specific purchase by ID
    const purchase = await Purchase.findOne({
      where: {
        id_purchase: id,
      },
      include: [
        {
          model: PurchaseRow,
          attributes: ["id_purchaserow", "name", "description" , "category", "subcategory", "unit_price", "quantity", "totalprice"],
          include: [
            {
              model: sequelize.models.Category,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name"],
            },
          ]
        },
        {
          model: Company,
          attributes: ["id_company", "name"],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
        }
      ],
    });

    if (!purchase) {
      return res.status(404).json({
        message: 'Purchase not found',
      });
    }

    res.json({
      purchase: purchase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

export default router;
