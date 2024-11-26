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

router.get("/read/", (req, res) => {
    // Get the role from the database
    const Permission = sequelize.models.Permission;

    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    Permission.findAll({  
       })
    .then((permissions) => {

      
        if (permissions) {
            res.status(200).json({
                message: "Permissions found",
                permissions: permissions,
            });
        } else {
            res.status(400).json({
                message: "Permissions do not exist",
            });
        }
    })
    .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
    });
});


// Rotta per ottenere i permessi di un ruolo specifico
router.get("/role/:roleId", (req, res) => {
    const roleId = req.params.roleId;  // Ottieni l'ID del ruolo dalla richiesta

    // Get the role from the database
    const Role = sequelize.models.Role;
    Role.findAll({
        where: { id_role: roleId }, // Filtro per il ruolo
        include: {
            model: sequelize.models.Permission, 
            attributes: ['id_permission', 'module', 'description', 'route'] // Seleziona le colonne necessarie
        }
    })
    .then((permissions) => {
        if (permissions && permissions.length > 0) {
            // Rispondi con i permessi
            res.status(200).json({
                message: "Permessi trovati",
                permissions: permissions,
            });
        } else {
            // Se non ci sono permessi per il ruolo
            res.status(404).json({
                message: "Nessun permesso trovato per questo ruolo",
            });
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Errore interno del server",
        });
    });
});

export default router;