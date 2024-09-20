import express from "express";
import path from "path";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

// __dirname
const __dirname = path.resolve();

router.get("/read/", (req, res) => {
    // Get the role from the database
    const Location = sequelize.models.Location;

    Location.findAll()
    .then((locations) => {
        res.status(200).json({
            message: "Locations found",
            locations: locations,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
        });
    });
});

export default router;
