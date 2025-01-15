const prisma = require('../config/prisma');

const saleController = {
    createSale: async (req, res) => {
        const { paymentMethod, products } = req.body;
        try {
            const result = await prisma.$transaction(async (tx) => {
                let total = 0;
                // Validar stock y calcular total
                for (const item of products) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        throw new Error(`Producto con ID ${item.productId} no encontrado`);
                    }

                    if (product.stock < item.quantity) {
                        throw new Error(`Stock insuficiente para ${product.name}`);
                    }

                    total += product.salePrice * item.quantity;
                }

                // Crear la venta
                const sale = await tx.sale.create({
                    data: {
                        paymentMethod,
                        total,
                        details: {
                            create: products.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price,
                                subtotal: item.price * item.quantity
                            }))
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

                // Actualizar stock
                for (const item of products) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });
                }

                return sale;
            });

            res.status(201).json(result);
        } catch (error) {
            console.error('Error en createSale:', error);
            res.status(400).json({ error: error.message });
        }
    },

    getAllSales: async (req, res) => {
        try {
            const sales = await prisma.sale.findMany({
                include: {
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
            res.json(sales);
        } catch (error) {
            console.error('Error en getAllSales:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getSaleById: async (req, res) => {
        try {
            const { id } = req.params;
            const sale = await prisma.sale.findUnique({
                where: { id: parseInt(id) },
                include: {
                    details: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!sale) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }

            res.json(sale);
        } catch (error) {
            console.error('Error en getSaleById:', error);
            res.status(500).json({ error: error.message });
        }
    },

    generateInvoice: async (req, res) => {
        try {
            const { id } = req.params;
            const sale = await prisma.sale.findUnique({
                where: { id: parseInt(id) },
                include: {
                    details: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!sale) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }

            res.json(sale);
        } catch (error) {
            console.error('Error en generateInvoice:', error);
            res.status(500).json({ error: error.message });
        }
    },
    cancelSale: async (req, res) => {
      try {
          const { id } = req.params;
          const { reason } = req.body;

          const result = await prisma.$transaction(async (tx) => {
              // Verificar que la venta existe y no está ya cancelada
              const sale = await tx.sale.findUnique({
                  where: { id: parseInt(id) },
                  include: {
                      details: {
                          include: {
                              product: true
                          }
                      }
                  }
              });

              if (!sale) {
                  throw new Error('Venta no encontrada');
              }

              if (sale.status === 'CANCELLED') {
                  throw new Error('La venta ya está cancelada');
              }

              // Restaurar el stock
              for (const detail of sale.details) {
                  await tx.product.update({
                      where: { id: detail.productId },
                      data: {
                          stock: {
                              increment: detail.quantity
                          }
                      }
                  });
              }

              // Actualizar el estado de la venta
              const updatedSale = await tx.sale.update({
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

              return updatedSale;
          });

          res.json(result);
      } catch (error) {
          console.error('Error en cancelSale:', error);
          res.status(400).json({ error: error.message });
      }
  }

};

module.exports = saleController;