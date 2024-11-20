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
// Route per aggiornare una Technical Area
router.put('/update', async (req, res) => {
    const user=req.user;
    const { id, name, code } = req.body; // Nuovi dati da aggiornare
  
    try {
      // Validazione dei dati di input
      if (!name && !code) {
        return res.status(400).json({
          message: 'At least one field (name or code) is required to update',
        });
      }
  
      // Assicuriamoci che il modello sia caricato
      const TechnicalArea = sequelize.models.TechnicalArea;
      if (!TechnicalArea) {
        throw new Error('Technical Area model is not loaded');
      }
  
      // Trova l'elemento da aggiornare
      const technicalArea = await TechnicalArea.findByPk(id);
      if (!technicalArea) {
        return res.status(404).json({
          message: `Technical Area with ID ${id} not found`,
        });
      }
  
      // Aggiorna i dati
      if (name) technicalArea.name = name;
      if (code) technicalArea.code = code;
  
      // Salva le modifiche nel database
      await technicalArea.save();
  
      res.status(200).json({
        message: 'Technical Area updated successfully',
        technicalArea,
      });
    } catch (error) {
      Logger('error', error);
  
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  });
  
  router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // ID dell'elemento da eliminare
  
    try {
      // Assicuriamoci che il modello sia caricato
      const TechnicalArea = sequelize.models.TechnicalArea;
      if (!TechnicalArea) {
        throw new Error('Technical Area model is not loaded');
      }
  
      // Trova l'elemento da eliminare
      const technicalArea = await TechnicalArea.findByPk(id);
      if (!technicalArea) {
        return res.status(404).json({
          message: `Technical Area with ID ${id} not found`,
        });
      }
  
      // Elimina l'elemento
      await technicalArea.destroy();
  
      res.status(200).json({
        message: 'Technical Area deleted successfully',
      });
    } catch (error) {
      Logger('error', error);
  
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  });
  
  


export default router;
