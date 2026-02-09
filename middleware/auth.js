const jwt = require("jsonwebtoken")

/* ****************************
 * Middleware to check account type for inventory admin routes
 * Redirects non-admin/employee users to login
 **************************** */
const checkAdminAuth = (req, res, next) => {
  const token = req.cookies.jwt
  
  if (!token) {
    req.flash("notice", "Please log in to access inventory management.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.accountData = decoded

    // Only allow Employee and Admin types
    if (decoded.account_type !== "Employee" && decoded.account_type !== "Admin") {
      req.flash("notice", "You do not have permission to access inventory management.")
      return res.redirect("/account/management")
    }

    next()
  } catch (error) {
    req.flash("notice", "Session expired. Please log in again.")
    res.clearCookie("jwt")
    res.redirect("/account/login")
  }
}

module.exports = { checkAdminAuth }
