const notificationService = require('../services/notificationService');

const notificationController = {
    getLowStockAlerts: async (req, res) => {
        try {
            const alerts = await notificationService.checkLowStock();
            res.json(alerts);
        } catch (error) {
            console.error('Error in getLowStockAlerts:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = notificationController;