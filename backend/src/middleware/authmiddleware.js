import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import sequelize from '../utils/db.js';

const __dirname = path.resolve();

const protect = async (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1] || "";
        const User = sequelize.models.User;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const publicKey = fs.readFileSync(
            path.resolve(__dirname, "src/keys/public.key") // Corrected the path
        );

        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
        });

        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = await User.findOne({
            where: { id_user: decoded.id, sessionId: decoded.sessionId },
            attributes: ["id_user", "name", "surname", "birthdate", "username", "email", "isDeleted", "isActive", "createdAt", "updatedAt", "sessionId", "subgroup"],
            include: [
                {
                    model: sequelize.models.Role,
                    attributes: ["id_role", "name"],
                },
                {
                    model: sequelize.models.Group,
                    attributes: ["id_group", "name"],
                },
                {
                    model: sequelize.models.Subgroup,
                    attributes: ["id_subgroup", "name"],
                }
            ],
        });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: 'Not authorized, token failed'
        });
    }
};

export default protect;
