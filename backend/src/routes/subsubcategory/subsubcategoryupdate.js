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
// Route per aggiornare una Subcategory
router.put('/update', async (req, res) => {
    const user=req.user;
    const { id, name } = req.body; // Nuovi dati da aggiornare
  
    try {
      // Validazione dei dati di input
      if (!name ) {
        return res.status(400).json({
          message: 'At least one field (name or category) is required to update',
        });
      }
  
      // Assicuriamoci che il modello sia caricato
      const Subsubcategory = sequelize.models.Subsubcategory;
      if (!Subsubcategory) {
        throw new Error('Subsubcategory model is not loaded');
      }
  
      // Trova l'elemento da aggiornare
      const subsubcategory = await Subsubcategory.findByPk(id);
      if (!subsubcategory) {
        return res.status(404).json({
          message: `Subcategory with ID ${id} not found`,
        });
      }
  
      // Aggiorna i dati
      if (name) subsubcategory.name = name;
  
      // Salva le modifiche nel database
      await subsubcategory.save();
  
      res.status(200).json({
        message: 'Subsubcategory updated successfully',
        subsubcategory,
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
      const Subsubcategory = sequelize.models.Subsubcategory;
      if (!Subsubcategory) {
        throw new Error('Subcategory model is not loaded');
      }
  
      // Trova l'elemento da eliminare
      const subsubcategory = await Subsubcategory.findByPk(id);
      if (!subsubcategory) {
        return res.status(404).json({
          message: `Subsubcategory with ID ${id} not found`,
        });
      }
  
      // Elimina l'elemento
      await subsubcategory.destroy();
  
      res.status(200).json({
        message: 'Subsubcategory deleted successfully',
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
