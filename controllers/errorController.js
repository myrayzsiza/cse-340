// src/controllers/errorController.js

const errorController = {}

// Handle 404 (page not found)
errorController.handle404 = (req, res, next) => {
  res.status(404).render("errors/error", {
    title: "Page Not Found",
    message: "Sorry, the page you requested does not exist."
  })
}

// Handle 500 (server error)
errorController.handle500 = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: "Something went wrong on our end."
  })
}

// src/controllers/errorController.js

const errorController = {}

// This matches the route in server.js
errorController.triggerError = (req, res, next) => {
  // Intentionally throw an error to test your 500 handler
  next(new Error("This is an intentional test error"))
}



module.exports = errorController
