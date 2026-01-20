const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')

// Detail view: /inventory/detail/:invId
router.get('/detail/:invId', inventoryController.getVehicleDetail)

module.exports = router
