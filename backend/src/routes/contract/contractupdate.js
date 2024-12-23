import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { Op } from 'sequelize';
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Contract = sequelize.models.Contract;
const ContractRow = sequelize.models.ContractRow;

// __dirname
const __dirname = path.resolve();

const publickey = fs.readFileSync(__dirname + "/src/keys/public.key", "utf8");
router.put("/update", async (req, res) => {
  const user = req.user;  // Assuming req.user is populated by the authentication middleware

  try {
    console.log('Request Body:', req.body); // Log della richiesta

    const { id_contract, id_company, payment, date_start, date_end, banktransfer, total, taxed_total, recurrence, recurrence_number,  currency, status, contractrows , deposit, referent, job} = req.body;

    console.log(req.body);

    if (!id_contract) {
      return res.status(400).json({ message: "Contract ID is required" });
    }

    const contract = await Contract.findByPk(id_contract);

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
  // Modifica il nome solo se lo stato dell'acquisto è "Approvato"
  if (contract.status === "Approvato") {
    if (contract.name) {
      const match = contract.name.match(/_R(\d+)$/); // Cerca suffisso _R0, _R1, etc.
      if (match) {
        const number = parseInt(match[1], 10); // Estrai il numero dal suffisso
        contract.name = contract.name.replace(/_R\d+$/, `_R${number + 1}`); // Incrementa il numero
      } else {
        // Se non c'è suffisso, aggiungi _R1 come suffisso iniziale
        contract.name = `${contract.name}_R1`;
      }
    }
  }

    contract.id_company = id_company || contract.id_company;
    contract.payment_method = payment || contract.payment_method;
    contract.contract_start_date = date_start || contract.date_start;
    contract.contract_start_end = date_end || contract.date_end;
    contract.deposit = deposit ;
    contract.job= job || contract.job;
    contract.banktransfer = banktransfer || contract.banktransfer;
    contract.referent = referent;
    contract.currency = currency || contract.currency;
    contract.status = "In Approvazione" || contract.status;
    contract.total = total || contract.total;
    contract.taxed_total = taxed_total || contract.taxed_total;
    contract.recurrence = recurrence;
    contract.recurrence_number = recurrence_number || contract.recurrence_number;
    contract.updatedBy = user.id_user;
    contract.updatedAt = new Date();

    await contract.save();

    if (contractrows) {  // Create the associated contract rows
      for (let i = 0; i < contractrows.length; i++) {
        const contractrow = contractrows[i];
      
        // Calcolo del numero incrementale usando l'indice i
        let increment = (i + 1) * 10;
      
        // Dividere il nome originale nelle sue parti
        let parts = contract.name.split("_"); // ["ODA24", "00015", "R1"]
      
        // Ricomporre il nome con il nuovo numero nella posizione desiderata
        let ContractRowName = `${parts[0]}_${parts[1]}_${increment}_${parts[2]}`;
      
        // Estrarre il nome base (senza suffisso numerico)
        const baseName = contractrow?.name?.replace(/_R\d+$/, "");
      
        const existingRow = await ContractRow.findOne({
          where: {
            id_contract: id_contract,
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
        await ContractRow.create({
          id_contract: id_contract,
          name: ContractRowName,
          description: contractrow.description,
          category: contractrow.category,
          subcategory: contractrow.subcategory,
          subsubcategory: contractrow.subsubcategory,
          unit_price: contractrow.unit_price,
          vat: contractrow.vat,
          taxed_unit_price: contractrow.taxed_unit_price,
          taxed_totalprice: contractrow.taxed_totalprice,
          quantity: contractrow.quantity,
          totalprice: contractrow.totalprice,
          
        });
      }
      
    }

    res.status(200).json({ message: "Contract updated" });
  } catch (error) {
    console.error('Error:', error); // Log dell'errore
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
