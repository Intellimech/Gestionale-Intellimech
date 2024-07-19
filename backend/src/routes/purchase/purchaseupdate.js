import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import sequelize from '../../utils/db.js';

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + '/src/keys/public.key', 'utf8');

router.put('/update/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  jwt.verify(token, publickey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    try {
      const { id } = req.params;
      const { id_company, products, date, payment, currency } = req.body;

      if (!id_company || !products || !date) {
        return res.status(400).json({
          message: 'Bad request, view documentation for more information',
        });
      }

      // Check if the purchase exists
      const purchase = await Purchase.findByPk(id);
      if (!purchase) {
        return res.status(404).json({
          message: 'Purchase not found',
        });
      }

      // Update purchase details
      purchase.id_company = id_company;
      purchase.payment_method = payment;
      purchase.date = date;
      purchase.currency = currency;
      purchase.total = products.reduce((acc, product) => acc + (product.unit_price * product.quantity), 0);

      await purchase.save();

      // Delete existing rows
      await PurchaseRow.destroy({ where: { id_purchase: id } });

      // Add new rows
      for (const product of products) {
        await PurchaseRow.create({
          id_purchase: id,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          unit_price: product.unit_price,
          quantity: product.quantity,
          totalprice: product.unit_price * product.quantity,
        });
      }

      res.status(200).json({
        message: 'Purchase updated successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  });
});

export default router;
