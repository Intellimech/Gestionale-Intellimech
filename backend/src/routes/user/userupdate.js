import express from 'express';
import bcrypt from 'bcrypt';
import sequelize from '../../utils/db.js';
import Logger from '../../utils/logger.js';

// Setup the express router
const router = express.Router();

router.put("/update", async (req, res) => {

    const user = req.user;  
    
    const { user_id, name, surname, username, password, email, role, birthdate, group, subGroup, contractType, institute, qualification, hWeek, TaxIdCode, Phone, hiringdate, drivingLicenseExp, country, streetaddress, city, province, zip, sessionId, changepass, birthprovince, businessphone } = req.body;

    // Debugging: log the request body
    console.log(req.body);
    try {
        // Recupera il modello User
        const User = sequelize.models.User;

        // Cerca l'utente nel database
        const user = await User.findOne({ where: { id_user: user_id } });

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Hash della nuova password solo se è stata fornita
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Aggiorna i dati dell'utente
        await user.update({
            name,
            surname,
            birthdate,
            username,
            email,
            password: hashedPassword,
            role,
            isActive: false,            
            isDeleted: false,          
            lastLoginAt: null,
            lastLoginIp: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            createdBy: user.id_user,
            updatedBy: user.id_user,
            deletedBy: null,
            group,
            subGroup,
            contractType,
            institute,
            qualification,
            hWeek,
            TaxIdCode,
            Phone,
            hiringdate,
            drivingLicenseExp,
            country,
            streetaddress,
            city,
            province,
            zip,
            sessionId,
            changepass,
            birthprovince,
            businessphone
        });

        // Risposta di successo
        return res.status(200).json({ message: "User updated successfully" });

    } catch (error) {
        // Log dell'errore
        Logger("error", 'Error updating user:', error);

        // Risposta in caso di errore interno del server
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // ID dell'elemento da eliminare
  
    try {
      // Assicuriamoci che il modello sia caricato
      const User = sequelize.models.User;
      if (!User) {
        throw new Error('User model is not loaded');
      }
  
      // Trova l'elemento da eliminare
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          message: `User with ID ${id} not found`,
        });
      }
  
      // Elimina l'elemento
      await user.destroy();
  
      res.status(200).json({
        message: 'User deleted successfully',
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
