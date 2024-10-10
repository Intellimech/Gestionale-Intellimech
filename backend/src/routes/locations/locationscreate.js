import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sequelize from "../../utils/db.js"; // Assicurati che il percorso sia corretto
import Logger from "../../utils/logger.js"; // Assicurati che il percorso sia corretto

const router = express.Router();

router.use(cors());
router.use(bodyParser.json());

router.post("/create", async (req, res) => {
    try {
        const { name, hours, needApproval } = req.body;

        const user = req.user;  // Assuming req.user is populated by the authentication middleware
        const Location = sequelize.models.Location;                     
        // Validazione dei dati
        if (!name ) {
            return res.status(400).json({
                
            });
        }

        // Creiamo una nuova location nel database
        const location = await Location.create({
            name: name,
            hours: hours,
            needApproval: needApproval
        });

        res.status(201).json({
            message: "Location created successfully",
            location: location,
        });
    } catch (error) {
        // Log dell'errore
        Logger("error", error);

        // Risposta di errore
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

export default router;
