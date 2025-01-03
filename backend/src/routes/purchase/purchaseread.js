import express from 'express';
import sequelize from '../../utils/db.js';

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;
const Company = sequelize.models.Company;

// Funzione per formattare i nomi
function formatName(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

router.get('/read', async (req, res) => {
  try {
    // Get all the purchases
    const purchases = await Purchase.findAll({
      include: [
        {
          model: PurchaseRow,
          attributes: [
            "id_purchaserow",
            "name",
            "description",
            "depreciation",
            "depreciation_aliquota",
            "depreciation_years",
            "depreciation_details",
            "asset",
            "category",
            "subcategory",
            "subsubcategory",
            "unit_price",
            "quantity",
            "vat",
            "totalprice",
            "taxed_unit_price",
            "taxed_totalprice"
          ],
          include: [
            {
              model: sequelize.models.Category,
              attributes: ["name","aliquota", "years"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name","aliquota", "years"],
            },
            {
              model: sequelize.models.Subsubcategory,
              attributes: ["name", "aliquota", "years"],
            },
            
          ],
        },
        {
          model: sequelize.models.PaymentMethod,
          attributes: ["name"],
        },
        {
              model: sequelize.models.Currency,
              attributes: ["name", "symbol", "code"],
            },
        {
          model: Company,
          attributes: ["id_company", "name"],
        },
        {
          model: sequelize.models.Job,
          attributes: ["name" ],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
        },
        {
          model: sequelize.models.User,
          as: 'referentUser',
          attributes: ['id_user', 'name', 'surname'],
        }
      ],
    });

    // Formatta il nome della compagnia per ogni acquisto
    const formattedPurchases = purchases.map((purchase) => {
      if (purchase.Company && purchase.Company.name) {
        purchase.Company.name = formatName(purchase.Company.name);
      }
      return purchase;
    });

    res.json({
      purchases: formattedPurchases,
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
          attributes: [
            "id_purchaserow",
            "name",
            "description",
            "depreciation",
            "depreciation_aliquota",
            "depreciation_years",
            
            "depreciation_details",
            "asset",
            "category",
            "subcategory",
            "subsubcategory",
            "unit_price",
            "quantity",
            "vat",
            "totalprice",
            "taxed_unit_price",
            "taxed_totalprice"
          ],
          include: [
            {
              model: sequelize.models.Category,
              attributes: ["name"],
            },
            {
              model: sequelize.models.Subcategory,
              attributes: ["name"],
            },
          ],
        },
        {
          model: sequelize.models.PaymentMethod,
          attributes: ["name"],
        },
        {
          model: Company,
          attributes: ["id_company", "name"],
        },
        {
          model: sequelize.models.Currency,
          attributes: ["name", "symbol", "code"],
        },
        {
          model: sequelize.models.Job,
          attributes: ["name" ],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
        },
        {
          model: sequelize.models.User,
          as: 'referentUser',
          attributes: ['id_user', 'name', 'surname'],
        }
      ],
    });

    if (!purchase) {
      return res.status(404).json({
        message: 'Purchase not found',
      });
    }

    // Formatta il nome della compagnia
    if (purchase.Company && purchase.Company.name) {
      purchase.Company.name = formatName(purchase.Company.name);
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
