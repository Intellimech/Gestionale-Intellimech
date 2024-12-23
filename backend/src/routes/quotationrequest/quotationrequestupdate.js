import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();
router.put('/update/:id', async (req, res) => {
  const user = req.user;  // Assicurati che req.user sia settato da middleware di autenticazione, se necessario
  const { externalcode } = req.body; // Nuovi dati da aggiornare
  const { id } = req.params;

  if (!externalcode) {
    return res.status(400).json({ message: "Invalid request: 'externalcode' is required." });
  }

  const QuotationRequest = sequelize.models.QuotationRequest;

  try {
    // Trova la quotation da aggiornare
    const quotation = await QuotationRequest.findByPk(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'QuotationRequest not found.' });
    }

    // Aggiorna il campo externalcode
    quotation.externalcode = externalcode;
    await quotation.save();

    return res.status(200).json({
      message: 'QuotationRequest updated successfully.',
      quotation,
    });
  } catch (error) {
    Logger.error('Error updating QuotationRequest:', error); // Usa il tuo logger per tracciare errori
    return res.status(500).json({ message: 'Internal server error.' });
  }
});


export default router;
