const utilities = require("../utilities")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

baseController.buildAbout = async function(req, res){
  const nav = await utilities.getNav()
  res.render("about", {title: "About Us", nav})
}

baseController.buildContact = async function(req, res){
  const nav = await utilities.getNav()
  res.render("contact", {title: "Contact Us", nav})
}

/* *********************************
 * Task 3 Trigger a 500 Server Error
 * ****************************** */
baseController.triggerError = async function (req, res, next) {
  throw new Error("500 Server Error")  
}


module.exports = baseController