import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

router.post("/create", async (req, res) => {
  const Role = sequelize.models.Role;
  const RolePermission = sequelize.models.RolePermissions;

  try {
    const { name, permissions } = req.body;
    const user = req.user;  // Assuming req.user is populated by the authentication middleware

    // Validazione dei dati in input
    if (!name || !permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "Bad request, 'name' and 'permissions' are required and 'permissions' must be a non-empty array.",
      });
    }

    // Creazione del ruolo
    const role = await Role.create({
      name: name,
      isDeleted: 0,  // Use user ID from req.user if needed for tracking purposes
    });

    // Creazione delle voci di RolePermissions in base ai permessi forniti
    const rolePermissionsData = permissions.map(permissionId => ({
      id_role: role.id_role,
      id_permissions: permissionId,
    }));

    // Inserimento multiplo dei permessi
    await RolePermission.bulkCreate(rolePermissionsData);

    res.status(201).json({
      message: "Role created successfully with associated permissions",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
