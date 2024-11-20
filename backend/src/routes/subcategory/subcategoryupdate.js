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
    const { id, name, category } = req.body; // Nuovi dati da aggiornare
  
    try {
      // Validazione dei dati di input
      if (!name && !category) {
        return res.status(400).json({
          message: 'At least one field (name or category) is required to update',
        });
      }
  
      // Assicuriamoci che il modello sia caricato
      const Subcategory = sequelize.models.Subcategory;
      if (!Subcategory) {
        throw new Error('Subcategory model is not loaded');
      }
  
      // Trova l'elemento da aggiornare
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) {
        return res.status(404).json({
          message: `Subcategory with ID ${id} not found`,
        });
      }
  
      // Aggiorna i dati
      if (name) subcategory.name = name;
      if (category) subcategory.category = category;
  
      // Salva le modifiche nel database
      await subcategory.save();
  
      res.status(200).json({
        message: 'Subcategory updated successfully',
        subcategory,
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
      const Subcategory = sequelize.models.Subcategory;
      if (!Subcategory) {
        throw new Error('Subcategory model is not loaded');
      }
  
      // Trova l'elemento da eliminare
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) {
        return res.status(404).json({
          message: `Subcategory with ID ${id} not found`,
        });
      }
  
      // Elimina l'elemento
      await subcategory.destroy();
  
      res.status(200).json({
        message: 'Subcategory deleted successfully',
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
