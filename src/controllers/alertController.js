const prisma = require('../config/prisma');

const alertController = {
    getInventoryAlerts: async (req, res) => {
        try {
            const alerts = await prisma.product.findMany({
                where: {
                    stock: {
                        lte: prisma.product.fields.minStock
                    }
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    stock: true,
                    minStock: true,
                    category: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: [
                    {
                        stock: 'asc'
                    }
                ]
            });

            // Clasificar las alertas por nivel de urgencia
            const criticalAlerts = alerts.filter(product => product.stock === 0);
            const lowStockAlerts = alerts.filter(product => product.stock > 0 && product.stock <= product.minStock);

            const summary = {
                total_alerts: alerts.length,
                critical_count: criticalAlerts.length,
                low_stock_count: lowStockAlerts.length,
                critical_items: criticalAlerts,
                low_stock_items: lowStockAlerts
            };

            res.json(summary);
        } catch (error) {
            console.error('Error en getInventoryAlerts:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getStockSummary: async (req, res) => {
        try {
            const products = await prisma.product.groupBy({
                by: ['categoryId'],
                _count: {
                    _all: true
                },
                _min: {
                    stock: true
                },
                _max: {
                    stock: true
                }
            });

            // Obtener detalles de categorías
            const categoriesData = await Promise.all(
                products.map(async (group) => {
                    const category = await prisma.category.findUnique({
                        where: { id: group.categoryId }
                    });
                    return {
                        category_name: category.name,
                        total_products: group._count._all,
                        min_stock: group._min.stock,
                        max_stock: group._max.stock
                    };
                })
            );

            res.json(categoriesData);
        } catch (error) {
            console.error('Error en getStockSummary:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = alertController;