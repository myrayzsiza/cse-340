const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')

// Detail view: /inventory/detail/:invId
router.get('/detail/:invId', inventoryController.getVehicleDetail)

module.exports = router
router.get('/inv', invController.buildManagementView)

router.get('/inv/add-classification', invController.buildAddClassification)
router.post('/inv/add-classification',
  classificationRules(),
  checkClassificationData,
  invController.addClassification
)

const { classificationRules, checkClassificationData } = require('../middleware/classificationValidation')
const { inventoryRules, checkInventoryData } = require('../middleware/inventoryValidation')

// Classification routes
router.get('/inv/add-classification', invController.buildAddClassification)
router.post('/inv/add-classification',
  classificationRules(),
  checkClassificationData,
  invController.addClassification
)

// Inventory routes
router.get('/inv/add-inventory', invController.buildAddInventory)
router.post('/inv/add-inventory',
  inventoryRules(),
  checkInventoryData,
  invController.addInventory
)

const express = require('express')
const router = express.Router()
const invController = require('../controllers/inventoryController')
const { classificationRules, checkClassificationData } = require('../middleware/classificationValidation')
const { inventoryRules, checkInventoryData } = require('../middleware/inventoryValidation')

// Management view
router.get('/inv', invController.buildManagementView)

// Classification routes
router.get('/inv/add-classification', invController.buildAddClassification)
router.post('/inv/add-classification',
  classificationRules(),
  checkClassificationData,
  invController.addClassification
)

// Inventory routes
router.get('/inv/add-inventory', invController.buildAddInventory)
router.post('/inv/add-inventory',
  inventoryRules(),
  checkInventoryData,
  invController.addInventory
)

module.exports = router;