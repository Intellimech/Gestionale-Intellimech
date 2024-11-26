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

router.get("/read/:user_id", (req, res) => {
    // Get the user from the database
    const { user_id } = req.params;
    if (!user_id) {
        res.status(400).json({
        message: "Bad request, view documentation for more information",
        });
        return;
    }
    const User = sequelize.models.User;

    User.findOne({ 
            where: { id_user: user_id },
            include: [
                {
                    model: sequelize.models.Role,
                    attributes: ["id_role", "name"],
                    include: [
                        {
                            model: sequelize.models.Permission,
                            attributes: ["id_permission", "name"],
                        },
                    ],
                },
            ],
        })
        .then((user) => {
        if (user) {
            res.status(200).json({
            message: "User found",
            user: user,
            });
        } else {
            res.status(400).json({
            message: "User does not exist",
            });
        }
        })
        .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
        Logger("error", err);
        });
});

router.get("/read/", (req, res) => {
    // Get the user from the database all users
    const User = sequelize.models.User;
    const { force } = req.body;
    let user = null;
    


    user = User.findAll({
        where: {
            isdeleted: false, // Add this condition to filter out users with isDelete true
        },
        include: [
            {
                model: sequelize.models.Role,
                attributes: ["id_role", "name"],
                include: [
                    {
                        model: sequelize.models.Permission,
                        attributes: ["id_permission", "description", "route"],
                    },
                ],
            },
            {
                model: sequelize.models.Group,
                attributes: ["id_group", "name"],
            },
            {
                model: sequelize.models.Subgroup,
                attributes: ["id_subgroup", "name"],
            },
            {
                model: sequelize.models.ContractType,
                attributes: ["id_contracttype", "name"],
            },
            {
                model: sequelize.models.WorkingSite,
                attributes: ["id_workingsite", "SiteCode", "GeneralName"],
            },
        ],
    })
    .then((users) => {
        if (users.length > 0) {
            res.status(200).json({
                message: "Users found",
                users: users,
            });
        } else {
            res.status(400).json({
                message: "No users found",
            });
        }
    })
    .catch((err) => {
        res.status(500).json({
            message: "Internal server error",
        });
        Logger("error", err);
    });
});

// Rotta per ottenere gli utenti con un determinato ruolo
router.get("/:roleId/role", (req, res) => {
    const roleId = req.params.roleId;  // Ottieni l'ID del ruolo dalla richiesta
    const User = sequelize.models.User; // Modello degli utenti
    const Role = sequelize.models.Role; // Modello dei ruoli
  
    // Trova gli utenti che hanno il ruolo specificato
    User.findAll({
      where: { roleId: roleId },  // Filtra per roleId (l'ID del ruolo)
      include: {
        model: Role, // Unisci con la tabella dei ruoli
        as: 'role',  // Usa l'alias definito nell'associazione
        attributes: ['id_role', 'name'],  // Seleziona le colonne necessarie dal ruolo
      },
      attributes: ['id_user', 'name', 'email'], // Seleziona le colonne necessarie per l'utente
    })
      .then((users) => {
        if (users && users.length > 0) {
          // Se ci sono utenti con questo ruolo
          res.status(200).json({
            message: "Utenti trovati",
            users: users,  // Restituisci gli utenti
          });
        } else {
          // Se non ci sono utenti con questo ruolo
          res.status(404).json({
            message: "Nessun utente trovato per questo ruolo",
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

  router.get("/role/:roleId", async (req, res) => {
    const roleId = req.params.roleId; // Ottieni l'ID del ruolo dalla richiesta

    const User = sequelize.models.User;
    User.findAll({
        where: { role: roleId }, // Filtro per il ruolo
      
    })
    .then((users) => {
        if (users && users.length > 0) {
            // Rispondi con i permessi
            res.status(200).json({
                message: "Utenti trovati",
                users: users,
            });
        } else {
            // Se non ci sono permessi per il ruolo
            res.status(404).json({
                message: "Nessun utente trovato per questo ruolo",
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



  

// router.get("/group/", (req, res) => {
//     // Get the user from the token and return the group name that is a relation
//     const token = req.headers["authorization"]?.split(" ")[1] || "";
//     if (!token) {
//         return res.status(401).json({
//             message: "Unauthorized",
//         });
//     }

//     try {
//         const publicKey = fs.readFileSync(
//             path.resolve(__dirname, "./src/keys/public.key")
//         );
    
//         const decoded = jwt.verify(token, publicKey, {
//             algorithms: ["RS256"],
//         });
    
//         const User = sequelize.models.User;

//         User.findOne({
//             where: { id_user: decoded.id },
//             attributes: ["id_user", "name", "surname", "username", "email", "isDeleted", "isActive", "createdAt", "updatedAt"],
//             include: [
//                 {
//                     model: sequelize.models.Group,
//                     attributes: ["id_group", "name"],
//                 },
//             ],
//         }).then((user) => {
//             if (user) {
//                 return res.status(200).json({
//                     group: user.Group.name,
//                 });
//             } else {
//                 return res.status(401).json({
//                     message: "Unauthorized",
//                 });
//             }
//         });
//     } catch (error) {
//         Logger("error", error);
//         return res.status(401).json({
//             message: "Unauthorized",
//         });
//     }
// });

// router.get("/permissionss/", (req, res) => {
//     // Get the user from the token and return the group name that is a relation
//     const token = req.headers["authorization"]?.split(" ")[1] || "";
//     if (!token) {
//         return res.status(401).json({
//             message: "Unauthorized",
//         });
//     }

//     try {
//         const publicKey = fs.readFileSync(
//             path.resolve(__dirname, "./src/keys/public.key")
//         );
    
//         const decoded = jwt.verify(token, publicKey, {
//             algorithms: ["RS256"],
//         });
    
//         const User = sequelize.models.User;

//         User.findOne({
//             where: { id_user: decoded.id },
//             attributes: ["id_user", "name", "surname", "username", "email", "isDeleted", "isActive", "createdAt", "updatedAt"],
//             include: [
//                 {
//                     model: sequelize.models.Role,
//                     attributes: ["id_role", "name"],
//                     include: [
//                         {
//                             model: sequelize.models.Permission,
//                             attributes: ["id_permission", "name"],
//                         },
//                     ],
//                 },
//             ],
//         }).then((user) => {
//             if (user) {
//                 // Remove the rolepermissions property from each permissions object
//                 const permissionssWithoutrolepermissions = user.Role.Permissionss.map(permissions => {
//                     const { rolepermissions, ...permissionsWithoutrolepermissions } = permissions.toJSON();
//                     return permissionsWithoutrolepermissions;
//                 });
                
//                 return res.status(200).json({
//                     permissionss: permissionssWithoutrolepermissions,
//                 });
//             } else {
//                 return res.status(401).json({
//                     message: "Unauthorized",
//                 });
//             }
//         });
//     } catch (error) {
//         Logger("error", error);
//         return res.status(401).json({
//             message: "Unauthorized",
//         });
//     }
// });

export default router;