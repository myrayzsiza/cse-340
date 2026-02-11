// Needed Resources 
const express = require("express")
const router = new express.Router()
const orderController = require("../controllers/orderController")
const utilities = require("../utilities")
const { checkLogin } = require("../middleware/auth")

/* ****************************************
 * Order Routes - Protected with login
 **************************************** */

// Show checkout form
router.get("/checkout/:invId", checkLogin, utilities.handleErrors(orderController.buildCheckoutForm))

// Process order
router.post("/process/:invId", checkLogin, utilities.handleErrors(orderController.processOrder))

// Show order confirmation
router.get("/confirmation/:orderId", checkLogin, utilities.handleErrors(orderController.showConfirmation))

// Show order history
router.get("/history", checkLogin, utilities.handleErrors(orderController.showOrderHistory))

module.exports = router
