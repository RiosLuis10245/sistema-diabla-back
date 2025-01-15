const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

const authMiddleware = {
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Token no proporcionado' });
            }

            // Verificar si el token está en la lista negra
            const blacklistedToken = await prisma.blacklistedToken.findFirst({
                where: {
                    token: token,
                    expiresAt: {
                        gte: new Date()
                    }
                }
            });

            if (blacklistedToken) {
                return res.status(401).json({ error: 'Token invalidado' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            req.token = token; // Guardar el token para usarlo en logout
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    },

    isAdmin: (req, res, next) => {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
        }
        next();
    },

    // Nuevo middleware para vendedores
    isSeller: (req, res, next) => {
        if (!req.user || (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN')) {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de vendedor' });
        }
        next();
    }
};

module.exports = authMiddleware;