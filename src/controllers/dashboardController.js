const prisma = require('../config/prisma');

const dashboardController = {
    getStats: async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [
                todaySales,
                lowStockProducts,
                topProducts,
                recentSales,
                monthlySales
            ] = await Promise.all([
                // Ventas del día
                prisma.sale.findMany({
                    where: {
                        createdAt: {
                            gte: today
                        },
                        status: 'COMPLETED'
                    },
                    include: {
                        details: true
                    }
                }),

                // Productos con stock bajo
                prisma.product.findMany({
                    where: {
                        stock: {
                            lte: prisma.product.fields.minStock
                        }
                    },
                    include: {
                        category: true
                    }
                }),

                // Top 5 productos más vendidos
                prisma.saleDetail.groupBy({
                    by: ['productId'],
                    _sum: {
                        quantity: true,
                        subtotal: true
                    },
                    orderBy: {
                        _sum: {
                            quantity: 'desc'
                        }
                    },
                    take: 5
                }),

                // Últimas 5 ventas
                prisma.sale.findMany({
                    take: 5,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        details: {
                            include: {
                                product: {
                                    include: {
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }),

                // Ventas de los últimos 30 días
                prisma.sale.groupBy({
                    by: ['createdAt'],
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setDate(today.getDate() - 30))
                        },
                        status: 'COMPLETED'
                    },
                    _sum: {
                        total: true
                    }
                })
            ]);

            // Calcular ventas por categoría desde las ventas recientes
            const salesByCategory = {};
            recentSales.forEach(sale => {
                sale.details.forEach(detail => {
                    const categoryName = detail.product.category.name;
                    if (!salesByCategory[categoryName]) {
                        salesByCategory[categoryName] = 0;
                    }
                    salesByCategory[categoryName] += detail.subtotal;
                });
            });

            const dashboardStats = {
                today: {
                    totalSales: todaySales.length,
                    totalAmount: todaySales.reduce((sum, sale) => sum + sale.total, 0),
                    averageTicket: todaySales.length > 0 
                        ? todaySales.reduce((sum, sale) => sum + sale.total, 0) / todaySales.length 
                        : 0
                },
                lowStock: {
                    totalProducts: lowStockProducts.length,
                    products: lowStockProducts.map(product => ({
                        id: product.id,
                        name: product.name,
                        stock: product.stock,
                        minStock: product.minStock,
                        category: product.category.name
                    }))
                },
                topProducts: await Promise.all(
                    topProducts.map(async (item) => {
                        const product = await prisma.product.findUnique({
                            where: { id: item.productId },
                            include: { category: true }
                        });
                        return {
                            name: product.name,
                            category: product.category.name,
                            totalQuantity: item._sum.quantity,
                            totalSales: item._sum.subtotal
                        };
                    })
                ),
                recentSales: recentSales.map(sale => ({
                    id: sale.id,
                    total: sale.total,
                    date: sale.createdAt,
                    items: sale.details.length,
                    products: sale.details.map(detail => ({
                        name: detail.product.name,
                        quantity: detail.quantity,
                        price: detail.price
                    }))
                })),
                salesByCategory: Object.entries(salesByCategory).map(([category, total]) => ({
                    category,
                    total
                })),
                salesTrend: monthlySales.map(sale => ({
                    date: sale.createdAt,
                    total: sale._sum.total
                }))
            };

            res.json(dashboardStats);
        } catch (error) {
            console.error('Error en getStats:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = dashboardController;