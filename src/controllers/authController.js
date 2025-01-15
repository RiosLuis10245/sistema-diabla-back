const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

const authController = {
    register: async (req, res) => {
        try {
            const { username, password, name, role } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'El nombre de usuario ya existe' });
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    name,
                    role
                }
            });

            // Eliminar la contraseña del resultado
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Buscar usuario
            const user = await prisma.user.findUnique({
                where: { username }
            });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar token
            const token = jwt.sign(
                { 
                    userId: user.id,
                    username: user.username,
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: error.message });
        }
    },
    // Método especial para crear el primer admin
    initializeAdmin: async (req, res) => {
        try {
            // Verificar si ya existe algún usuario admin
            const existingAdmin = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            });

            if (existingAdmin) {
                return res.status(400).json({ 
                    error: 'Ya existe un administrador. Use la ruta normal de registro.' 
                });
            }

            const { username, password, name } = req.body;

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario admin
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    name,
                    role: 'ADMIN'
                }
            });

            // Eliminar la contraseña del resultado
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error('Error en initializeAdmin:', error);
            res.status(500).json({ error: error.message });
        }
    },
    logout: async (req, res) => {
        try {
            const token = req.token;
            const decoded = jwt.decode(token);
            
            // Añadir token a la lista negra
            await prisma.blacklistedToken.create({
                data: {
                    token: token,
                    expiresAt: new Date(decoded.exp * 1000) // Convertir timestamp a fecha
                }
            });

            res.json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;