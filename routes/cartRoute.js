// Needed Resources 
const express = require("express")
const router = new express.Router()
const cartController = require("../controllers/cartController")
const utilities = require("../utilities")
const { checkLogin } = require("../middleware/auth")

/* ****************************************
 * Cart Routes - Protected with login
 **************************************** */

// View cart
router.get("/view", checkLogin, utilities.handleErrors(cartController.viewCart))

// Add item to cart (AJAX)
router.post("/add/:invId", checkLogin, utilities.handleErrors(cartController.addToCart))

// Remove item from cart
router.get("/remove/:cartId", checkLogin, utilities.handleErrors(cartController.removeFromCart))

// Update quantity (AJAX)
router.post("/update-quantity/:cartId", checkLogin, utilities.handleErrors(cartController.updateQuantity))

// Clear cart
router.get("/clear", checkLogin, utilities.handleErrors(cartController.clearCart))

// Checkout from cart
router.get("/checkout", checkLogin, utilities.handleErrors(cartController.buildCheckoutForm))

// Process checkout
router.post("/process", checkLogin, utilities.handleErrors(cartController.processOrderFromCart))

// Confirm order
router.get("/confirm-order", checkLogin, utilities.handleErrors(cartController.confirmOrder))

// Order confirmation page
router.get("/order-confirmation", checkLogin, utilities.handleErrors(cartController.showOrderConfirmation))

module.exports = router
