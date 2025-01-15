const prisma = require('../config/prisma');

const reportController = {
    getDailySales: async (req, res) => {
        try {
            const { date } = req.query;
            const searchDate = date ? new Date(date) : new Date();

            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            const sales = await prisma.sale.findMany({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: {
                    details: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            // Calcular totales y estadísticas
            const summary = {
                date: startOfDay.toISOString().split('T')[0],
                total_sales: sales.length,
                total_amount: sales.reduce((sum, sale) => sum + sale.total, 0),
                sales_by_payment_method: {
                    CASH: sales.filter(sale => sale.paymentMethod === 'CASH').length,
                    CARD: sales.filter(sale => sale.paymentMethod === 'CARD').length,
                    TRANSFER: sales.filter(sale => sale.paymentMethod === 'TRANSFER').length
                },
                sales_detail: sales
            };

            res.json(summary);
        } catch (error) {
            console.error('Error en getDailySales:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getMonthlySales: async (req, res) => {
        try {
            const { year, month } = req.query;
            const searchDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);

            const startOfMonth = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
            const endOfMonth = new Date(searchDate.getFullYear(), searchDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const sales = await prisma.sale.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                _sum: {
                    total: true
                },
                _count: true
            });

            const summary = {
                year: searchDate.getFullYear(),
                month: searchDate.getMonth() + 1,
                total_sales: sales.reduce((sum, day) => sum + day._count, 0),
                total_amount: sales.reduce((sum, day) => sum + (day._sum.total || 0), 0),
                daily_sales: sales.map(day => ({
                    date: day.createdAt,
                    sales_count: day._count,
                    total_amount: day._sum.total
                }))
            };

            res.json(summary);
        } catch (error) {
            console.error('Error en getMonthlySales:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getTopProducts: async (req, res) => {
        try {
            const { startDate, endDate, limit = 10 } = req.query;

            const whereClause = {};
            if (startDate && endDate) {
                whereClause.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const salesDetails = await prisma.saleDetail.groupBy({
                by: ['productId'],
                where: whereClause,
                _sum: {
                    quantity: true,
                    subtotal: true
                }
            });

            const topProducts = await Promise.all(
                salesDetails
                    .sort((a, b) => b._sum.quantity - a._sum.quantity)
                    .slice(0, parseInt(limit))
                    .map(async (detail) => {
                        const product = await prisma.product.findUnique({
                            where: { id: detail.productId },
                            include: { category: true }
                        });
                        return {
                            product_name: product.name,
                            category: product.category.name,
                            total_quantity: detail._sum.quantity,
                            total_sales: detail._sum.subtotal
                        };
                    })
            );

            res.json(topProducts);
        } catch (error) {
            console.error('Error en getTopProducts:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = reportController;