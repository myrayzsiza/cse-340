const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const { classificationRules, checkClassificationData } = require('../middleware/classificationValidation');
const { inventoryRules, checkInventoryData } = require('../middleware/inventoryValidation');

// Detail view: /inventory/detail/:invId
router.get('/detail/:invId', invController.getVehicleDetail);

// Management view
router.get('/', invController.buildManagementView);
router.get('/inv', invController.buildManagementView);

// Classification routes
router.get('/inv/add-classification', invController.buildAddClassification);
router.post('/inv/add-classification',
  classificationRules(),
  checkClassificationData,
  invController.addClassification
);

// Inventory routes
router.get('/inv/add-inventory', invController.buildAddInventory);
router.post('/inv/add-inventory',
  inventoryRules(),
  checkInventoryData,
  invController.addInventory
);

module.exports = router;
