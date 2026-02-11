const roleModel = require("../models/role-model")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const { validationResult } = require("express-validator")

const adminCont = {}

/* ****************************
 *  Build admin dashboard
 **************************** */
adminCont.buildDashboard = async function (req, res, next) {
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

    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).render("errors/error", {
        title: "Access Denied",
        nav,
        message: "You do not have permission to access the admin dashboard.",
      })
    }

    const accounts = await roleModel.getAllAccountsWithRoles()
    const roles = await roleModel.getAllRoles()
    const roleStats = await roleModel.countAccountsByRole()

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      nav,
      accounts,
      roles,
      roleStats,
      errors: null,
    })
  } catch (error) {
    console.error("buildDashboard error: " + error)
    next(error)
  }
}

/* ****************************
 *  Build manage users view
 **************************** */
adminCont.buildManageUsers = async function (req, res, next) {
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

    const isAdmin = await roleModel.isAdmin(accountId)
    if (!isAdmin) {
      return res.status(403).render("errors/error", {
        title: "Access Denied",
        nav,
        message: "You do not have permission to access this page.",
      })
    }

    const accounts = await roleModel.getAllAccountsWithRoles()
    const roles = await roleModel.getAllRoles()

    res.render("admin/manage-users", {
      title: "Manage Users",
      nav,
      accounts,
      roles,
      errors: null,
    })
  } catch (error) {
    console.error("buildManageUsers error: " + error)
    next(error)
  }
}

/* ****************************
 *  Update user role
 **************************** */
adminCont.updateUserRole = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id
    const { userId, roleId } = req.body

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

    // Prevent changing own role
    if (parseInt(userId) === accountId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      })
    }

    // Validate role exists
    const role = await roleModel.getRoleById(roleId)
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    await roleModel.updateAccountRole(userId, roleId)

    res.json({
      success: true,
      message: "User role updated successfully",
    })
  } catch (error) {
    console.error("updateUserRole error: " + error)
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    })
  }
}

/* ****************************
 *  Delete user account (admin)
 **************************** */
adminCont.deleteUserAccount = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id
    const userId = req.params.userId

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

    // Prevent deleting own account
    if (parseInt(userId) === accountId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      })
    }

    // Delete account (cascading deletes will handle related data)
    await accountModel.deleteAccount(userId)

    res.json({
      success: true,
      message: "User account deleted",
    })
  } catch (error) {
    console.error("deleteUserAccount error: " + error)
    res.status(500).json({
      success: false,
      message: "Error deleting user account",
    })
  }
}

/* ****************************
 *  Get admin statistics
 **************************** */
adminCont.getStats = async function (req, res, next) {
  try {
    const accountId = res.locals.accountData?.account_id

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

    const roleStats = await roleModel.countAccountsByRole()

    res.json({
      success: true,
      stats: {
        totalUsers: roleStats.reduce((sum, r) => sum + (r.count || 0), 0),
        byRole: roleStats,
      },
    })
  } catch (error) {
    console.error("getStats error: " + error)
    res.status(500).json({
      success: false,
      message: "Error retrieving stats",
    })
  }
}

module.exports = adminCont
