const prisma = require('../config/prisma');

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      console.error('Error en getAllCategories:', error);
      res.status(500).json({ error: error.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      const category = await prisma.category.create({
        data: {
          name,
          description
        }
      });
      res.status(201).json(category);
    } catch (error) {
      console.error('Error en createCategory:', error);
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = categoryController;