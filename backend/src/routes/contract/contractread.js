import express from 'express';
import sequelize from '../../utils/db.js';

// Setup the express router
const router = express.Router();
const Contract = sequelize.models.Contract;
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
    // Get all contracts
    const contracts = await Contract.findAll({
      include: [
        {
          model: Company,
          attributes: ['id_company', 'name'],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
          foreignKey: 'createdBy'
        }
      ],
    });

    res.json({
      contracts: contracts,
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
    // Get the specific contract by ID
    const contract = await Contract.findOne({
      where: {
        id_contract: id,
      },
      include: [
        {
          model: Company,
          attributes: ['id_company', 'name'],
        },
        {
          model: sequelize.models.User,
          as: 'createdByUser',
          attributes: ['id_user', 'name', 'surname'],
          foreignKey: 'createdBy'
        }
      ],
      attributes: [
        'id_contract',
        'name',
        'payment_method',
        'IVA',
        'total',
        'currency',
        'recurrence',
        'contract_start_date',
        'contract_end_date',
        'status',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!contract) {
      return res.status(404).json({
        message: 'Contract not found',
      });
    }

    res.json({
      contract: contract,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

export default router;