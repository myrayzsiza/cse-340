// Needed Resources 
const express = require("express")

const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")
const utilities = require("../utilities")


// Classification view
router.get("/type/:classificationId", utilities.handleErrors(inventoryController.buildByClassificationId));


/* ****************************************
 * Route to build vehicle detail view
 **************************************** */

// Vehicle detail view by inventory id
router.get("/detail/:invId", utilities.handleErrors(inventoryController.getVehicleDetail));

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */

// Intentional 500 error route
router.get("/broken", utilities.handleErrors(inventoryController.throwError));


module.exports = router;