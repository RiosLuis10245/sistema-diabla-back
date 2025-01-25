const prisma = require('../config/prisma');

const supplierController = {
    createSupplier: async (req, res) => {
        try {
            const { name, ruc, address, phone, email } = req.body;
            const supplier = await prisma.supplier.create({
                data: {
                    name,
                    ruc,
                    address,
                    phone,
                    email
                }
            });
            res.status(201).json(supplier);
        } catch (error) {
            console.error('Error en createSupplier:', error);
            res.status(400).json({ error: error.message });
        }
    },

    getAllSuppliers: async (req, res) => {
        try {
            const suppliers = await prisma.supplier.findMany({
                include: {
                    _count: {
                        select: { purchases: true }
                    }
                }
            });
            res.json(suppliers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
     // Nuevo método para obtener proveedor por ID
     getSupplierById: async (req, res) => {
        try {
            const { id } = req.params;
            const supplier = await prisma.supplier.findUnique({
                where: { id: Number(id) },
                include: {
                    _count: {
                        select: { purchases: true }
                    }
                }
            });

            if (!supplier) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            res.json(supplier);
        } catch (error) {
            console.error('Error en getSupplierById:', error);
            res.status(500).json({ error: error.message });
        }
    },
    // Nuevo método para actualizar proveedor
    updateSupplier: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, ruc, address, phone, email } = req.body;

            const supplier = await prisma.supplier.update({
                where: { id: Number(id) },
                data: {
                    name,
                    ruc,
                    address,
                    phone,
                    email
                },
                include: {
                    _count: {
                        select: { purchases: true }
                    }
                }
            });

            res.json(supplier);
        } catch (error) {
            console.error('Error en updateSupplier:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
};

module.exports = supplierController;