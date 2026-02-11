const activityModel = require("../models/activity-model")
const roleModel = require("../models/role-model")
const utilities = require("../utilities")

const activityCont = {}

/* ****************************
 *  Log activity helper
 **************************** */
activityCont.logUserActivity = async function (accountId, actionType, description, req) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get("user-agent") || "Unknown"

    await activityModel.logActivity(accountId, actionType, description, ipAddress, userAgent)
  } catch (error) {
    console.error("logUserActivity error: " + error)
    // Don't throw - activity logging shouldn't break main functionality
  }
}

/* ****************************
 *  View user activity
 **************************** */
activityCont.viewUserActivity = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in to view activity" }],
      })
    }

    const activities = await activityModel.getActivityByAccountId(accountId, 50)

    res.render("account/activity", {
      title: "My Activity",
      nav,
      activities,
      errors: null,
    })
  } catch (error) {
    console.error("viewUserActivity error: " + error)
    next(error)
  }
}

/* ****************************
 *  View all activity (admin only)
 **************************** */
activityCont.viewAllActivity = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id

    if (!accountId) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Please log in" }],
      })
    }

    // Check if user is admin
    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).render("errors/error", {
        title: "Access Denied",
        nav,
        message: "You do not have permission to view this page.",
      })
    }

    const activities = await activityModel.getAllActivity(100)

    res.render("admin/activity-log", {
      title: "Activity Log",
      nav,
      activities,
      errors: null,
    })
  } catch (error) {
    console.error("viewAllActivity error: " + error)
    next(error)
  }
}

/* ****************************
 *  Get activity by date range (admin)
 **************************** */
activityCont.getActivityByDateRange = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = res.locals.accountData?.account_id
    const { startDate, endDate } = req.body

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      })
    }

    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const activities = await activityModel.getActivityByDateRange(startDate, endDate)

    res.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    console.error("getActivityByDateRange error: " + error)
    res.status(500).json({
      success: false,
      message: "Error retrieving activity",
    })
  }
}

module.exports = activityCont
