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
  const className = data[0]?.classification_name || "Vehicles"
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId
  let vehicle = await invModel.getInventoryById(invId)
  let nav = await utilities.getNav()
  if (!vehicle) {
    return res.status(404).render("../errors/404", { title: "Not Found", nav })
  }
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
  const vehicleTitle = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    message: null,
    htmlData,
  })
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let flashMessage = req.flash ? req.flash("message") : null
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    flashMessage,
  })
}

/* ***************************
 *  Build add classification form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
  const { classification_name } = req.body

  // Server-side validation: alphanumeric only, no spaces or special characters
  if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
    let nav = await utilities.getNav()
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: [{ msg: "Classification name must contain only letters and numbers (no spaces or special characters)." }],
    })
  }

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      // Flash message on successful insert
      if (req.flash) req.flash("message", `Classification "${classification_name}" added successfully!`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Failed to add classification. Please try again." }],
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add inventory form
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
  const {
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
  } = req.body

  // Server-side validation
  let errors = []

  // Check all required fields are present
  if (!inv_make || !inv_model || !inv_year || !inv_description || !inv_image || !inv_thumbnail || !inv_price || !inv_miles || !inv_color || !classification_id) {
    errors.push({ msg: "All fields are required." })
  }

  // Validate year is a valid number between 1900 and 2100
  if (inv_year && (isNaN(inv_year) || inv_year < 1900 || inv_year > 2100)) {
    errors.push({ msg: "Year must be a valid number between 1900 and 2100." })
  }

  // Validate price is a positive number
  if (inv_price && (isNaN(inv_price) || Number(inv_price) < 0)) {
    errors.push({ msg: "Price must be a positive number." })
  }

  // Validate miles is a non-negative number
  if (inv_miles && (isNaN(inv_miles) || Number(inv_miles) < 0)) {
    errors.push({ msg: "Mileage must be a non-negative number." })
  }

  // If validation errors, re-render form with sticky inputs
  if (errors.length > 0) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    return res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
      errors,
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
  }

  // All validation passed, attempt to insert into database
  try {
    const vehicleData = {
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
    }

    const result = await invModel.addInventory(vehicleData)
    if (result) {
      // Flash message on successful insert
      if (req.flash) req.flash("message", `${inv_year} ${inv_make} ${inv_model} added successfully!`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      res.render("./inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationSelect,
        errors: [{ msg: "Failed to add inventory item. Please try again." }],
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
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Intentional error (for testing)
 * ************************** */
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional 500 error for testing")
}

module.exports = invCont
