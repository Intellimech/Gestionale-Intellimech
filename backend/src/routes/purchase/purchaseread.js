import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import sequelize from '../../utils/db.js';

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;
const Company = sequelize.models.Company;

// __dirname
const __dirname = path.resolve();
const publickey = fs.readFileSync(__dirname + '/src/keys/public.key', 'utf8');

router.get('/read', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  jwt.verify(token, publickey, async (err, decoded) => {
    //get all the purchases
    const purchases = await Purchase.findAll({
      include: [
        {
          model: sequelize.models.PurchaseRow,
          attributes: ["id_purchaserow", "name", "description" ,"category", "subcategory", "unit_price", "quantity", "totalprice"],
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
  });
});

router.get('/read/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const id = req.params.id;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  jwt.verify(token, publickey, async (err, decoded) => {
    //get all the purchases
    const purchases = await Purchase.findOne({
      where: {
        id_purchase: id,
      },
      include: [
        {
          model: sequelize.models.PurchaseRow,
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

    res.json({
      purchases: purchases,
    });
  });
});

export default router;
