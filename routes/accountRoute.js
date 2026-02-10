const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const { checkLogin } = require("../middleware/auth")

/* ****************************
 * Account Management Routes
 **************************** */

// Get login view
router.get("/login", utilities.handleErrors(accountController.buildLoginView))

// Post login process
router.post("/login", utilities.handleErrors(accountController.processLogin))

// Get register view
router.get("/register", utilities.handleErrors(accountController.buildRegisterView))

// Post register process
router.post("/register", utilities.handleErrors(accountController.processRegister))

// Get account management view (Protected)
router.get("/management", checkLogin, utilities.handleErrors(accountController.buildAccountManagementView))

// Get account update view (Protected)
router.get("/update", checkLogin, utilities.handleErrors(accountController.buildAccountUpdateView))

// Process account information update (Protected)
router.post("/update-info", checkLogin, utilities.handleErrors(accountController.updateAccountInfo))

// Process password change (Protected)
router.post("/change-password", checkLogin, utilities.handleErrors(accountController.changePassword))

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

module.exports = router
