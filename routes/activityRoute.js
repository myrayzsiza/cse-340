const express = require("express")
const router = express.Router()
const activityController = require("../controllers/activityController")
const utilities = require("../utilities")

// Get user activity
router.get("/", utilities.checkLogin, activityController.viewUserActivity)

// Get all activity (admin only)
router.get("/all", utilities.checkLogin, activityController.viewAllActivity)

// Get activity by date range (admin only)
router.post("/date-range", utilities.checkLogin, activityController.getActivityByDateRange)

module.exports = router
