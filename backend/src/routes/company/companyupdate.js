// routes/companyRoutes.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import sequelize from "../../utils/db.js"; // Assicurati che il percorso sia corretto
import Logger from "../../utils/logger.js"; // Assicurati che il percorso sia corretto
import Company from "../../models/company.js"; // Assicurati che il percorso sia corretto

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.post("/update", async (req, res) => {
    try {
      const {
        id,
        name,
        isClient,
        isSupplier,
        clienttype,
        vat,
        fiscalcode,
        SDI,
        PEC,
        address,
        ZIP,
        city,
        province,
        country,
      } = req.body;

      console.log(req.body)
  
      // Find the existing company record
      const company = await Company.findByPk(id);
  
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
  
      // Update the company record with the new data
      await company.update({
        name,
        isClient,
        isSupplier,
        companytype : clienttype,
        VAT: vat,
        Fiscal_Code: fiscalcode,
        SDI,
        PEC,
        Address: address,
        ZIP,
        City: city,
        Province: province,
        Country: country,
      });
  
      res.status(200).json({ message: "Company updated successfully", company });
    } catch (error) {
      Logger("error", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

export default router;
