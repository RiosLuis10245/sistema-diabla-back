const prisma = require('../config/prisma');

const notificationService = {
    checkLowStock: async () => {
        try {
            const lowStockProducts = await prisma.product.findMany({
                where: {
                    stock: {
                        lte: prisma.product.fields.minStock
                    }
                },
                include: {
                    category: true
                }
            });

            // Clasificar por nivel de urgencia
            const criticalProducts = lowStockProducts.filter(product => product.stock === 0);
            const warningProducts = lowStockProducts.filter(product => product.stock > 0 && product.stock <= product.minStock);

            return {
                hasAlerts: lowStockProducts.length > 0,
                totalAlerts: lowStockProducts.length,
                critical: {
                    count: criticalProducts.length,
                    products: criticalProducts.map(product => ({
                        id: product.id,
                        name: product.name,
                        category: product.category.name,
                        stock: product.stock,
                        minStock: product.minStock
                    }))
                },
                warning: {
                    count: warningProducts.length,
                    products: warningProducts.map(product => ({
                        id: product.id,
                        name: product.name,
                        category: product.category.name,
                        stock: product.stock,
                        minStock: product.minStock
                    }))
                }
            };
        } catch (error) {
            console.error('Error checking low stock:', error);
            throw error;
        }
    }
};

module.exports = notificationService;