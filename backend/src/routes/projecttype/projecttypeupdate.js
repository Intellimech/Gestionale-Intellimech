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

// __dirdescription


const __dirname = path.resolve();
// Route per aggiornare una Technical Area
router.put('/update', async (req, res) => {
    const user=req.user;
    const { id, description, code } = req.body; // Nuovi dati da aggiornare
  
    try {
      // Validazione dei dati di input
      if (!description && !code) {
        return res.status(400).json({
          message: 'At least one field (name or code) is required to update',
        });
      }
  
      // Assicuriamoci che il modello sia caricato
      const ProjectType = sequelize.models.ProjectType;
      if (!ProjectType) {
        throw new Error('Project Type model is not loaded');
      }
  
      // Trova l'elemento da aggiornare
      const projecttype = await ProjectType.findByPk(id);
      if (!projecttype) {
        return res.status(404).json({
          message: `Project Type with ID ${id} not found`,
        });
      }
  
      // Aggiorna i dati
      if (description) projecttype.description = description;
      if (code) projecttype.code = code;
  
      // Salva le modifiche nel database
      await projecttype.save();
  
      res.status(200).json({
        message: 'Project Type updated successfully',
        projecttype,
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
      const ProjectType = sequelize.models.ProjectType;
      if (!ProjectType) {
        throw new Error('Project Type model is not loaded');


      }
  
      // Trova l'elemento da eliminare
      const projecttype = await ProjectType.findByPk(id);
      if (!projecttype) {
        return res.status(404).json({
          message: `Project Type with ID ${id} not found`,
        });

      }
  
      // Elimina l'elemento
      await projecttype.destroy();
  
      res.status(200).json({
        message: 'Project Type deleted successfully',
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