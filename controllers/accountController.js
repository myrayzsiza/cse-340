const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")

const accCont = {}

/* ****************************
 *  Build account management view
 **************************** */
accCont.buildAccountManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let message = req.flash("message") || null
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    message,
  })
}

/* ****************************
 *  Build account update view
 **************************** */
accCont.buildAccountUpdateView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const accountId = res.locals.accountData.account_id
  const account = await accountModel.getAccountById(accountId)
  
  if (!account) {
    return res.status(404).render("../errors/404", { title: "Not Found", nav })
  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData: account,
    errors: null,
  })
}

/* ****************************
 *  Process account information update
 **************************** */
accCont.updateAccountInfo = async function (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  // Server-side validation
  let errors = []

  if (!account_firstname || account_firstname.trim() === "") {
    errors.push({ msg: "First name is required." })
  }

  if (!account_lastname || account_lastname.trim() === "") {
    errors.push({ msg: "Last name is required." })
  }

  if (!account_email || account_email.trim() === "") {
    errors.push({ msg: "Email is required." })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account_email)) {
    errors.push({ msg: "Valid email is required." })
  }

  if (errors.length > 0) {
    let nav = await utilities.getNav()
    const account = await accountModel.getAccountById(account_id)
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: account,
      account_firstname,
      account_lastname,
      account_email,
      errors,
    })
  }

  try {
    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      req.flash("message", "Account information updated successfully!")
      res.locals.accountData.account_firstname = account_firstname
      res.locals.accountData.account_lastname = account_lastname
      res.locals.accountData.account_email = account_email
      return res.redirect("/account/management")
    } else {
      let nav = await utilities.getNav()
      const account = await accountModel.getAccountById(account_id)
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: account,
        errors: [{ msg: "Failed to update account. Please try again." }],
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Process password change
 **************************** */
accCont.changePassword = async function (req, res, next) {
  const { account_id, account_password, account_password_confirm } = req.body

  // Server-side validation
  let errors = []

  if (!account_password || account_password.trim() === "") {
    errors.push({ msg: "New password is required." })
  } else if (account_password.length < 12) {
    errors.push({ msg: "Password must be at least 12 characters." })
  } else if (!/[A-Z]/.test(account_password)) {
    errors.push({ msg: "Password must contain at least one uppercase letter." })
  } else if (!/[a-z]/.test(account_password)) {
    errors.push({ msg: "Password must contain at least one lowercase letter." })
  } else if (!/\d/.test(account_password)) {
    errors.push({ msg: "Password must contain at least one digit." })
  } else if (!/[!@#$%^&*]/.test(account_password)) {
    errors.push({ msg: "Password must contain at least one special character (!@#$%^&*)." })
  }

  if (!account_password_confirm || account_password_confirm.trim() === "") {
    errors.push({ msg: "Please confirm your password." })
  } else if (account_password !== account_password_confirm) {
    errors.push({ msg: "Passwords do not match." })
  }

  if (errors.length > 0) {
    let nav = await utilities.getNav()
    const account = await accountModel.getAccountById(account_id)
    return res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: account,
      errors,
    })
  }

  try {
    // Hash password
    let hashedPassword = await bcrypt.hashSync(account_password, 10)

    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
      req.flash("message", "Password changed successfully!")
      return res.redirect("/account/management")
    } else {
      let nav = await utilities.getNav()
      const account = await accountModel.getAccountById(account_id)
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: account,
        errors: [{ msg: "Failed to change password. Please try again." }],
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Logout
 **************************** */
accCont.logout = async function (req, res, next) {
  res.clearCookie("jwt")
  req.flash("message", "You have been logged out.")
  res.redirect("/")
}

module.exports = accCont
