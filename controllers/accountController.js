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
