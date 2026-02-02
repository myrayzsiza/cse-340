/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRouter = require("./routes/inventoryRoute")
const session = require('express-session');
const flash = require('connect-flash');

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs")
app.set("views", "./views")

/* ***********************
 * Session and Flash Middleware
 *************************/
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

/* ***********************
 * Serve static files from public directory
 *************************/
app.use(express.static('public'));

/* ***********************
 * Routes
 *************************/
// Index route
app.get("/", (req, res) => {
  res.render("index")
})

app.get("/about", (req, res) => {
  res.render("about")
})

app.get("/contact", (req, res) => {
  res.render("contact")
})

app.get("/test", (req, res) => {
  res.send("Server is running!");
});

app.use(static)
// Inventory routes (detail pages, etc.)
app.use('/inventory', inventoryRouter)

// Intentional error route via controller (MVC)
const errorController = require('./controllers/errorController')
app.get('/error/trigger', errorController.triggerError)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

/* ***********************
 * Error Handling
 *  - 404 handler (render friendly page)
 *  - 500 handler (global error middleware)
 *************************/
// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found' })
})

// 500 handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render('errors/500', { title: 'Server Error', error: err })
})
