import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { Op } from 'sequelize';
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");
router.put("/update", async (req, res) => {
  const user = req.user;  // Assuming req.user is populated by the authentication middleware

  try {
    console.log('Request Body:', req.body); // Log della richiesta

    const { id_purchase, id_company, payment_method, date, currency, status, products } = req.body;

    if (!id_purchase) {
      return res.status(400).json({ message: "Purchase ID is required" });
    }

    const purchase = await Purchase.findByPk(id_purchase);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.name) {
      const match = purchase.name.match(/_R(\d+)$/); // Cerca suffisso _R0, _R1, etc.
      if (match) {
        const number = parseInt(match[1], 10); // Estrai il numero dal suffisso
        purchase.name = purchase.name.replace(/_R\d+$/, `_R${number + 1}`); // Incrementa il numero
      } else {
        // Se non c'è suffisso, aggiungi _R1 come suffisso iniziale
        purchase.name = `${purchase.name}_R1`;
      }
    }

    purchase.id_company = id_company || purchase.id_company;
    purchase.payment_method = payment_method || purchase.payment_method;
    purchase.date = date || purchase.date;
    purchase.currency = currency || purchase.currency;
    purchase.status = status || purchase.status;
    purchase.updatedBy = user.id_user;
    purchase.updatedAt = new Date();

    await purchase.save();

    if (products) {  // Create the associated purchase rows
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
      
        // Calcolo del numero incrementale usando l'indice i
        let increment = (i + 1) * 10;
      
        // Dividere il nome originale nelle sue parti
        let parts = purchase.name.split("_"); // ["ODA24", "00015", "R1"]
      
        // Ricomporre il nome con il nuovo numero nella posizione desiderata
        let PurchaseRowName = `${parts[0]}_${parts[1]}_${increment}_${parts[2]}`;
      
        // Estrarre il nome base (senza suffisso numerico)
        const baseName = product.name.replace(/_R\d+$/, "");
      
        const existingRow = await PurchaseRow.findOne({
          where: {
            id_purchase: id_purchase,
            name: {
              [Op.like]: `${baseName}%`, // Usa Op.like per trovare righe che corrispondono al nome base
            }
          }
        });
      
        if (existingRow) {
          // Se esiste, cancella la riga
          await existingRow.destroy();
        }
      
        // Ora crea la nuova riga con il nuovo nome
        await PurchaseRow.create({
          id_purchase: id_purchase,
          name: PurchaseRowName,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          subsubcategory: product.subsubcategory,
          unit_price: product.unit_price,
          vat: product.vat,
          taxed_unit_price: product.taxed_unit_price,
          taxed_totalprice: product.taxed_totalprice,
          quantity: product.quantity,
          totalprice: product.totalprice,
          
        depreciation: product.depreciation || false,
        depreciation_years: product.depreciation ? parseInt(product.depreciation_years, 10) : null,
        depreciation_aliquota: product.depreciation ? product.depreciation_aliquota : null,
        depreciation_details: product.depreciation ? product.depreciation_details : null,
        asset: product.asset || false
        });
      }
      
    }

    res.status(200).json({ message: "Purchase updated" });
  } catch (error) {
    console.error('Error:', error); // Log dell'errore
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
