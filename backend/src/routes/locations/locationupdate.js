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

export default router;
