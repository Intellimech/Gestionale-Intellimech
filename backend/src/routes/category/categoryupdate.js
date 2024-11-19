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
// Route per aggiornare una Category
router.put('/update', async (req, res) => {
    const user=req.user;
    const { id, name } = req.body; // Nuovi dati da aggiornare
  
    try {
  
      // Assicuriamoci che il modello sia caricato
      const Category = sequelize.models.Category;
      if (!Category) {
        throw new Error('Category model is not loaded');
      }
  
      // Trova l'elemento da aggiornare
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`,
        });
      }
  
      // Aggiorna i dati
      if (name) category.name = name;
  
      // Salva le modifiche nel database
      await category.save();
  
      res.status(200).json({
        message: 'Category updated successfully',
        category,
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
      const Category = sequelize.models.Category;
      if (!Category) {
        throw new Error('Category model is not loaded');
      }
  
      // Trova l'elemento da eliminare
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`,
        });
      }
  
      // Elimina l'elemento
      await category.destroy();
  
      res.status(200).json({
        message: 'Category deleted successfully',
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
