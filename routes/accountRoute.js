const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

/* ****************************
 * Account Management Routes
 **************************** */

// Get account management view
router.get("/management", utilities.handleErrors(accountController.buildAccountManagementView))

// Get account update view
router.get("/update", utilities.handleErrors(accountController.buildAccountUpdateView))

// Process account information update
router.post("/update-info", utilities.handleErrors(accountController.updateAccountInfo))

// Process password change
router.post("/change-password", utilities.handleErrors(accountController.changePassword))

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

module.exports = router
