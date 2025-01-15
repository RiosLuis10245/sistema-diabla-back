const prisma = require('../config/prisma');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { supplierId, documentNumber, details } = req.body;

            const result = await prisma.$transaction(async (tx) => {
                // Calcular total
                const total = details.reduce((sum, item) => 
                    sum + (item.quantity * item.price), 0);

                // Crear la compra
                const purchase = await tx.purchase.create({
                    data: {
                        supplierId,
                        documentNumber,
                        total,
                        details: {
                            create: details.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price,
                                subtotal: item.quantity * item.price
                            }))
                        }
                    },
                    include: {
                        supplier: true,
                        details: {
                            include: {
                                product: true
                            }
                        }
                    }
                });

                // Actualizar stock y precio de compra de productos
                for (const item of details) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            },
                            purchasePrice: item.price
                        }
                    });
                }

                return purchase;
            });

            res.status(201).json(result);
        } catch (error) {
            console.error('Error en createPurchase:', error);
            res.status(400).json({ error: error.message });
        }
    },

    getAllPurchases: async (req, res) => {
        try {
            const purchases = await prisma.purchase.findMany({
                include: {
                    supplier: true,
                    details: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPurchaseById: async (req, res) => {
        try {
            const { id } = req.params;
            const purchase = await prisma.purchase.findUnique({
                where: { id: parseInt(id) },
                include: {
                    supplier: true,
                    details: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!purchase) {
                return res.status(404).json({ error: 'Compra no encontrada' });
            }

            res.json(purchase);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    cancelPurchase: async (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const result = await prisma.$transaction(async (tx) => {
                // Verificar que la compra existe y no está ya cancelada
                const purchase = await tx.purchase.findUnique({
                    where: { id: parseInt(id) },
                    include: {
                        details: {
                            include: {
                                product: true
                            }
                        }
                    }
                });

                if (!purchase) {
                    throw new Error('Compra no encontrada');
                }

                if (purchase.status === 'CANCELLED') {
                    throw new Error('La compra ya está cancelada');
                }

                // Verificar stock suficiente para anular
                for (const detail of purchase.details) {
                    const product = await tx.product.findUnique({
                        where: { id: detail.productId }
                    });

                    if (product.stock < detail.quantity) {
                        throw new Error(`Stock insuficiente para anular la compra del producto ${product.name}`);
                    }
                }

                // Restar el stock
                for (const detail of purchase.details) {
                    await tx.product.update({
                        where: { id: detail.productId },
                        data: {
                            stock: {
                                decrement: detail.quantity
                            }
                        }
                    });
                }

                // Actualizar el estado de la compra
                const updatedPurchase = await tx.purchase.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'CANCELLED',
                        updatedAt: new Date()
                    },
                    include: {
                        details: {
                            include: {
                                product: true
                            }
                        }
                    }
                });

                return updatedPurchase;
            });

            res.json(result);
        } catch (error) {
            console.error('Error en cancelPurchase:', error);
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = purchaseController;