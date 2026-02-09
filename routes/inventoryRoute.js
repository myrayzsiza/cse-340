// Needed Resources 
const express = require("express")
const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")
const utilities = require("../utilities")
const { checkAdminAuth } = require("../middleware/auth")


/* ****************************************
 * Inventory Management Routes (Admin Protected)
 **************************************** */

// Management view
router.get("/", checkAdminAuth, utilities.handleErrors(inventoryController.buildManagementView))

// Add Classification - GET form
router.get("/add-classification", checkAdminAuth, utilities.handleErrors(inventoryController.buildAddClassification))

// Add Classification - POST process
router.post("/add-classification", checkAdminAuth, utilities.handleErrors(inventoryController.processAddClassification))

// Add Inventory - GET form
router.get("/add-inventory", checkAdminAuth, utilities.handleErrors(inventoryController.buildAddInventory))

// Add Inventory - POST process
router.post("/add-inventory", checkAdminAuth, utilities.handleErrors(inventoryController.processAddInventory))


/* ****************************************
 * Classification View Route
 **************************************** */

// Display inventory by classification
router.get("/type/:classificationId", utilities.handleErrors(inventoryController.buildByClassificationId))


/* ****************************************
 * Vehicle Detail View Route
 **************************************** */

// Display vehicle detail by inventory id
router.get("/detail/:invId", utilities.handleErrors(inventoryController.getVehicleDetail))


/* ****************************************
 * Error Route (Assignment 3, Task 3)
 **************************************** */

// Intentional 500 error route for testing
router.get("/broken", utilities.handleErrors(inventoryController.throwError))


module.exports = router