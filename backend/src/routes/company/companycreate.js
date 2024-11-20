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

router.post("/create", async (req, res) => {
    try {
        const {
            name,
            VAT,
            Fiscal_Code,
            SDI,
            PEC,
            Address,
            ZIP,
            City,
            Province,
            Country,
            isClient,
            isSuppliers,
            clienttype, // Questo rappresenta il selectedClientType dal frontend
        } = req.body;

        // Generazione del `Code` progressivo basato sull'ultimo valore in DB
        const lastCompany = await Company.findOne({
            order: [["Code", "DESC"]],
        });

        let newCode = "C00001";
        if (lastCompany) {
            const lastCodeNumber = parseInt(lastCompany.Code.slice(1)) + 1;
            newCode = `C${String(lastCodeNumber).padStart(5, "0")}`;
        }

        // Creazione del nuovo record Company con i campi forniti
        const newCompany = await Company.create({
            Code: newCode,
            name,
            VAT,
            Fiscal_Code,
            SDI,
            PEC,
            Address,
            ZIP,
            City,
            Province,
            Country,
            isClient: Boolean(parseInt(isClient)),
            isSuppliers: Boolean(parseInt(isSuppliers)),
            companytype: clienttype, // Inserisce il valore di `selectedClientType` dal frontend
        });

        res.status(201).json({
            message: "Azienda creata con successo",
            company: newCompany,
        });
    } catch (error) {
        Logger("error", error);
        res.status(500).json({
            message: "Errore interno del server",
            error: error.message,
        });
    }
});

export default router;
