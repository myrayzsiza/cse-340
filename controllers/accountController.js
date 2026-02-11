const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")

const accCont = {}

/* ****************************
 *  Build login view
 **************************** */
accCont.buildLoginView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************
 *  Build register view
 **************************** */
accCont.buildRegisterView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************
 *  Process login
 **************************** */
accCont.processLogin = async function (req, res, next) {
  const { account_email, account_password } = req.body
  const jwt = require("jsonwebtoken")
  
  // Server-side validation
  let errors = []

  if (!account_email || account_email.trim() === "") {
    errors.push({ msg: "Email is required." })
  }

  if (!account_password || account_password.trim() === "") {
    errors.push({ msg: "Password is required." })
  }

  if (errors.length > 0) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email,
    })
  }

  try {
    // Get account by email
    const account = await accountModel.getAccountByEmail(account_email)

    if (!account) {
      let nav = await utilities.getNav()
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(account_password, account.account_password)

    if (!isPasswordValid) {
      let nav = await utilities.getNav()
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        account_email,
      })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        account_id: account.account_id,
        account_firstname: account.account_firstname,
        account_lastname: account.account_lastname,
        account_email: account.account_email,
        account_type: account.account_type,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    )

    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 })
    req.flash("message", "Welcome back, " + account.account_firstname + "!")
    res.redirect("/account/management")
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Process registration
 **************************** */
accCont.processRegister = async function (req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password, account_password_confirm } = req.body

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

  if (!account_password || account_password.trim() === "") {
    errors.push({ msg: "Password is required." })
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
    return res.render("account/register", {
      title: "Register",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  try {
    // Check if email already exists
    const existingAccount = await accountModel.getAccountByEmail(account_email)

    if (existingAccount) {
      let nav = await utilities.getNav()
      return res.render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: "Email is already registered." }],
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    // Hash password
    let hashedPassword = await bcrypt.hashSync(account_password, 10)

    // Register new account
    const registerResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (registerResult) {
      req.flash("message", "Registration successful! Please log in with your credentials.")
      res.redirect("/account/login")
    } else {
      let nav = await utilities.getNav()
      return res.render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: "Registration failed. Please try again." }],
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (error) {
    next(error)
  }
}

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
  const accountId = req.params.accountId
  
  // Security check: users can only update their own account
  if (parseInt(accountId) !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/management")
  }
  
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

  // Security check: users can only update their own account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/management")
  }

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
    // Check if email already exists (and belongs to a different account)
    const existingAccount = await accountModel.getAccountByEmail(account_email)
    if (existingAccount && existingAccount.account_id != account_id) {
      let nav = await utilities.getNav()
      const account = await accountModel.getAccountById(account_id)
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: account,
        account_firstname,
        account_lastname,
        account_email,
        errors: [{ msg: "Email is already registered with another account." }],
      })
    }

    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      // Update session data with new account information
      req.flash("message", "Account information updated successfully!")
      if (res.locals.accountData) {
        res.locals.accountData.account_firstname = account_firstname
        res.locals.accountData.account_lastname = account_lastname
        res.locals.accountData.account_email = account_email
      }
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
  const { account_id, current_password, account_password, account_password_confirm } = req.body

  // Security check: users can only change their own password
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to change that password.")
    return res.redirect("/account/management")
  }

  // Server-side validation
  let errors = []

  if (!current_password || current_password.trim() === "") {
    errors.push({ msg: "Current password is required." })
  }

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
    // Verify current password before allowing change
    const account = await accountModel.getAccountById(account_id)
    
    if (!account) {
      let nav = await utilities.getNav()
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: null,
        errors: [{ msg: "Account not found." }],
      })
    }
    
    const isPasswordValid = await bcrypt.compare(current_password, account.account_password)

    if (!isPasswordValid) {
      let nav = await utilities.getNav()
      const accountData = await accountModel.getAccountById(account_id)
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: accountData,
        errors: [{ msg: "Current password is incorrect." }],
      })
    }

    // Hash new password
    let hashedPassword = await bcrypt.hashSync(account_password, 10)

    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
      req.flash("message", "Password changed successfully!")
      return res.redirect("/account/management")
    } else {
      let nav = await utilities.getNav()
      const accountData = await accountModel.getAccountById(account_id)
      return res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: accountData,
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

/* ****************************
 *  Build forgot password view
 **************************** */
accCont.buildForgotPasswordView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/forgot-password", {
    title: "Forgot Password",
    nav,
    errors: null,
  })
}

/* ****************************
 *  Process forgot password request
 **************************** */
accCont.processForgotPassword = async function (req, res, next) {
  const { account_email } = req.body

  // Server-side validation
  let errors = []

  if (!account_email || account_email.trim() === "") {
    errors.push({ msg: "Email is required." })
  }

  if (errors.length > 0) {
    let nav = await utilities.getNav()
    return res.render("account/forgot-password", {
      title: "Forgot Password",
      nav,
      errors,
      account_email,
    })
  }

  try {
    // Check if account exists
    const account = await accountModel.getAccountByEmail(account_email)

    if (!account) {
      // For security, always show success message even if email doesn't exist
      req.flash("message", "If an account exists with that email, a password reset link has been sent.")
      return res.redirect("/account/login")
    }

    // Generate reset token (crypto random string)
    const crypto = require("crypto")
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour expiration

    // Save reset token to database
    await accountModel.saveResetToken(account_email, resetToken, expiresAt)

    // TODO: Send email with reset link
    // For now, log to console for testing
    console.log(`Password reset link: /account/reset-password/${resetToken}`)

    req.flash("message", "If an account exists with that email, a password reset link has been sent.")
    res.redirect("/account/login")
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Build reset password view
 **************************** */
accCont.buildResetPasswordView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { token } = req.params

  try {
    // Verify token exists and hasn't expired
    const account = await accountModel.getAccountByResetToken(token)

    if (!account) {
      req.flash("notice", "Password reset link has expired or is invalid. Please request a new one.")
      return res.redirect("/account/forgot-password")
    }

    res.render("account/reset-password", {
      title: "Reset Password",
      nav,
      token,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Process reset password
 **************************** */
accCont.processResetPassword = async function (req, res, next) {
  const { token, account_password, account_password_confirm } = req.body

  // Server-side validation
  let errors = []

  if (!token || token.trim() === "") {
    errors.push({ msg: "Invalid reset token." })
  }

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
    return res.render("account/reset-password", {
      title: "Reset Password",
      nav,
      token,
      errors,
    })
  }

  try {
    // Verify token and get account
    const account = await accountModel.getAccountByResetToken(token)

    if (!account) {
      req.flash("notice", "Password reset link has expired or is invalid. Please request a new one.")
      return res.redirect("/account/forgot-password")
    }

    // Hash new password
    let hashedPassword = await bcrypt.hashSync(account_password, 10)

    // Update password and clear reset token
    await accountModel.updatePassword(account.account_id, hashedPassword)
    await accountModel.clearResetToken(account.account_id)

    req.flash("message", "Your password has been reset successfully. Please log in with your new password.")
    res.redirect("/account/login")
  } catch (error) {
    next(error)
  }
}

module.exports = accCont
