const prisma = require('../config/prisma');

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true
        }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true
        }
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { code, name, purchasePrice, salePrice, stock, minStock, categoryId } = req.body;
      const product = await prisma.product.create({
        data: {
          code,
          name,
          purchasePrice: parseFloat(purchasePrice),
          salePrice: parseFloat(salePrice),
          stock: parseInt(stock),
          minStock: parseInt(minStock),
          categoryId: parseInt(categoryId)
        }
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  searchProducts: async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { code: query },
                    { name: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                category: true
            }
        });

        // Si es un código de barras exacto y solo hay un resultado, destacarlo
        if (products.length === 1 && products[0].code === query) {
            return res.json({ exact_match: true, products });
        }

        res.json({ exact_match: false, products });
    } catch (error) {
        console.error('Error en searchProducts:', error);
        res.status(500).json({ error: error.message });
    }
},

getLowStockProducts: async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                stock: {
                    lte: prisma.product.fields.minStock
                }
            },
            include: {
                category: true
            }
        });

        res.json(products);
    } catch (error) {
        console.error('Error en getLowStockProducts:', error);
        res.status(500).json({ error: error.message });
    }
},
updateProduct: async (req, res) => {
  try {
      const { id } = req.params;
      const { code, name, purchasePrice, salePrice, stock, minStock, categoryId } = req.body;

      const product = await prisma.product.update({
          where: { id: parseInt(id) },
          data: {
              code,
              name,
              purchasePrice: parseFloat(purchasePrice),
              salePrice: parseFloat(salePrice),
              stock: parseInt(stock),
              minStock: parseInt(minStock),
              categoryId: parseInt(categoryId)
          },
          include: {
              category: true
          }
      });

      res.json(product);
  } catch (error) {
      console.error('Error en updateProduct:', error);
      res.status(400).json({ error: error.message });
  }
},
getProductByBarcode: async (req, res) => {
  try {
      const { code } = req.params;

      const product = await prisma.product.findUnique({
          where: { code },
          include: {
              category: true
          }
      });

      if (!product) {
          return res.status(404).json({ 
              error: 'Producto no encontrado',
              code 
          });
      }

      // Incluir alerta de stock bajo si corresponde
      const stockAlert = product.stock <= product.minStock ? {
          isLow: true,
          current: product.stock,
          minimum: product.minStock
      } : null;

      res.json({
          id: product.id,
          code: product.code,
          name: product.name,
          price: product.salePrice,
          stock: product.stock,
          category: product.category.name,
          stockAlert
      });

  } catch (error) {
      console.error('Error en getProductByBarcode:', error);
      res.status(500).json({ error: error.message });
  }
}
};

module.exports = productController;