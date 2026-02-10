/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require('./utilities/index')
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const session = require("express-session")
const flash = require("connect-flash")

const pool = require('./database/')


/* ***********************
 * View Engine And Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Middleware
 * ************************/

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "default-secret",
  resave: true,
  saveUninitialized: true,
}))

// Flash messaging middleware
app.use(flash())

// Make flash messages available in routes
app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})

// Parse cookies for JWT authentication
app.use(cookieParser())

// Parse form data from request body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve static files from the public directory (for images, css, js, etc.)
app.use(express.static("public"))

// Check JWT and set accountData in res.locals for all views
app.use((req, res, next) => {
  res.locals.accountData = null
  try {
    const token = req.cookies.jwt
    if (token) {
      const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.accountData = accountData
    }
  } catch (error) {
    // Token is invalid or expired, accountData remains null
  }
  next()
})

/* ***********************
 * Routes
 *************************/
app.use(static)
//Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))

// About and Contact routes
app.get("/about", utilities.handleErrors(baseController.buildAbout))
app.get("/contact", utilities.handleErrors(baseController.buildContact))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)




// 404 handler (must be last route)
app.use(async (req, res, next) => {
  let nav = await utilities.getNav();
  res.status(404).render("errors/404", { title: "404 Not Found", nav });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    res.status(404).render("errors/404", { title: "404 Not Found", nav });
  } else {
    res.status(500).render("errors/500", { title: "500 Server Error", nav });
  }
});




/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})