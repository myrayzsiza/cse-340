const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 *  Assignment 3, Task 1
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId
  let vehicle = await invModel.getInventoryById(invId)
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
  let nav = await utilities.getNav()
  const vehicleTitle =
    vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    message: null,
    htmlData,
  })
}

/* ****************************
 *  Build inventory management view
 *  Assignment 4, Task 1
 * *************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let message = req.flash("message") || null
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    flashMessage: message,
  })
}

/* ****************************
 *  Build add classification view
 *  Assignment 4, Task 2
 * *************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ****************************
 *  Process add classification
 *  Assignment 4, Task 2
 * *************************** */
invCont.processAddClassification = async function (req, res, next) {
  const { classification_name } = req.body
  
  try {
    const result = await invModel.addClassification(classification_name)
    
    if (result) {
      // Refresh navigation to show new classification
      let nav = await utilities.getNav()
      req.flash("message", `Classification "${classification_name}" added successfully!`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Failed to add classification. Please try again." }],
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************
 *  Build add inventory view
 *  Assignment 4, Task 3
 * *************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ****************************
 *  Process add inventory
 *  Assignment 4, Task 3
 * *************************** */
invCont.processAddInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  
  try {
    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
    
    if (result) {
      req.flash("message", `${inv_year} ${inv_make} ${inv_model} added to inventory successfully!`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationSelect,
        errors: [{ msg: "Failed to add inventory item. Please try again." }],
        ...req.body,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process intentional error
 *  Assignment 3, Task 3
 * ************************************ */
invCont.throwError = async function (req, res) {
  throw new Error("I made this error on purpose")
}


module.exports = invCont