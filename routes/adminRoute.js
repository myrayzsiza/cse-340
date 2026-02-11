const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const utilities = require("../utilities")

// Admin dashboard
router.get("/dash", utilities.checkLogin, adminController.buildDashboard)

// Manage users
router.get("/users", utilities.checkLogin, adminController.buildManageUsers)

// Update user role
router.post("/users/role", utilities.checkLogin, adminController.updateUserRole)

// Delete user account
router.delete("/users/:userId", utilities.checkLogin, adminController.deleteUserAccount)

// Get admin stats API
router.get("/api/stats", utilities.checkLogin, adminController.getStats)

module.exports = router
