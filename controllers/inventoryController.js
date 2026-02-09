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

// Build vehicle detail view
invCont.getVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId;
  let vehicle = await invModel.getInventoryById(invId);
  let nav = await utilities.getNav();
  if (!vehicle) {
    return res.status(404).render("../errors/404", { title: "Not Found", nav });
  }
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle);
  const vehicleTitle = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    message: null,
    htmlData,
  });
};

// Management View
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    flashMessage: req.flash ? req.flash("message") : null,
  });
};

// Add Classification Form
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    flashMessage: req.flash ? req.flash("message") : null,
  });
};

// Process Add Classification
invCont.processAddClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    // Server-side validation: only letters and numbers, no spaces/specials
    if (!/^[A-Za-z0-9]+$/.test(classification_name)) {
      let nav = await utilities.getNav();
      return res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Classification name must be alphanumeric with no spaces or special characters." }],
        flashMessage: null,
      });
    }
    const result = await invModel.addClassification(classification_name);
    if (result) {
      if (req.flash) req.flash("message", "Classification added successfully!");
      return res.redirect("/inv/");
    } else {
      let nav = await utilities.getNav();
      return res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Failed to add classification. Try again." }],
        flashMessage: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

// Add Inventory Form
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    flashMessage: req.flash ? req.flash("message") : null,
    classificationSelect,
    // Sticky fields
    ...req.body,
  });
};

// Process Add Inventory
invCont.processAddInventory = async function (req, res, next) {
  try {
    const {
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    } = req.body;

    // Server-side validation
    let errors = [];
    if (!inv_make || !inv_model || !inv_year || !inv_description ||
        !inv_image || !inv_thumbnail || !inv_price || !inv_miles ||
        !inv_color || !classification_id) {
      errors.push({ msg: "All fields are required." });
    }
    if (isNaN(inv_year) || inv_year < 1900 || inv_year > 2100) {
      errors.push({ msg: "Year must be a valid number between 1900 and 2100." });
    }
    if (isNaN(inv_price) || inv_price < 0) {
      errors.push({ msg: "Price must be a positive number." });
    }
    if (isNaN(inv_miles) || inv_miles < 0) {
      errors.push({ msg: "Miles must be a positive number." });
    }
    if (errors.length > 0) {
      let nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors,
        flashMessage: null,
        classificationSelect,
        ...req.body,
      });
    }

    // Insert into DB
    const vehicleData = {
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    };
    const result = await invModel.addInventory(vehicleData);
    if (result) {
      if (req.flash) req.flash("message", "Inventory item added successfully!");
      return res.redirect("/inv/");
    } else {
      let nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: [{ msg: "Failed to add inventory item. Try again." }],
        flashMessage: null,
        classificationSelect,
        ...req.body,
      });
    }
  } catch (err) {
    next(err);
  }
};

/* ****************************************
 *  Process intentional error
 * ************************************ */

// Intentional error for testing
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional 500 error for testing");
};

module.exports = invCont
