import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../../utils/db.js";
import Logger from "../../utils/logger.js";


const router = express.Router();

// Endpoint per aggiornare il campo needApproval
router.put('/update/:id', async (req, res) => {
  
  const user = req.user;  // Assuming req.user is populated by the authentication middleware

  const { id } = req.params;
  const { needApproval } = req.body; // Si aspetta che il corpo della richiesta contenga needApproval
  const Location = sequelize.models.Location;

  try {
    // Trova la location da aggiornare
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Aggiorna il campo needApproval
    location.needApproval = needApproval;
    await location.save();

    return res.status(200).json({ message: 'Location updated successfully', location });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update', async (req, res) => {
  const user=req.user;
  const { id, name, hour, approval } = req.body; // Nuovi dati da aggiornare

  try {
    // Validazione dei dati di input
    if (!name) {
      return res.status(400).json({
        message: 'At least one field is required to update',
      });
    }

    // Assicuriamoci che il modello sia caricato
    const Location = sequelize.models.Location;
    if (!Location) {
      throw new Error('Project Type model is not loaded');
    }

    // Trova l'elemento da aggiornare
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        message: `Project Type with ID ${id} not found`,
      });
    }

    // Aggiorna i dati
    if (name) location.name = name;
    if (hour) location.hours = hour;
    if (approval) location.approval = approval;

    // Salva le modifiche nel database
    await location.save();

    res.status(200).json({
      message: 'Project Type updated successfully',
      location,
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
    const Location = sequelize.models.Location;
    if (!Location) {
      throw new Error('Project Type model is not loaded');


    }

    // Trova l'elemento da eliminare
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        message: `Project Type with ID ${id} not found`,
      });

    }

    // Elimina l'elemento
    await location.destroy();

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
