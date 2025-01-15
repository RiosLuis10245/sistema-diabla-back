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
    }
};

module.exports = supplierController;