const inventoryModel = require('../models/inventoryModel')
const utilities = require('../utilities')

async function getVehicleDetail(req, res, next) {
  try {
    const invId = req.params.invId
    const vehicle = await inventoryModel.getVehicleById(invId)

    if (!vehicle) {
      return next()
    }

    // Utility now returns { title, html }
    const wrapped = utilities.buildVehicleDetailHTML(vehicle)
    res.render('inventory/detail', { detailHtml: wrapped.html, title: wrapped.title })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getVehicleDetail,
}

async function buildManagementView(req, res) {
  res.render('inventory/management', {
    title: 'Inventory Management',
    flashMessage: req.flash('notice')
  })
}

const invModel = require('../models/inventoryModel')
const Util = require('../utilities/')

// Management view
async function buildManagementView(req, res) {
  res.render('inventory/management', {
    title: 'Inventory Management',
    flashMessage: req.flash('notice')
  })
}

// Classification
async function buildAddClassification(req, res) {
  res.render('inventory/add-classification', { errors: null })
}

async function addClassification(req, res) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash('notice', 'Classification added successfully!')
    res.redirect('/inv')
  } else {
    req.flash('notice', 'Failed to add classification.')
    res.render('inventory/add-classification', { errors: null })
  }
}

// Inventory
async function buildAddInventory(req, res) {
  const classificationSelect = await Util.buildClassificationList()
  res.render('inventory/add-inventory', {
    errors: null,
    classificationSelect
  })
}

async function addInventory(req, res) {
  const { inv_make, inv_model, classification_id } = req.body
  const result = await invModel.addInventory(inv_make, inv_model, classification_id)

  if (result) {
    req.flash('notice', 'Inventory item added successfully!')
    res.redirect('/inv')
  } else {
    req.flash('notice', 'Failed to add inventory item.')
    const classificationSelect = await Util.buildClassificationList(classification_id)
    res.render('inventory/add-inventory', {
      errors: null,
      ...req.body,
      classificationSelect
    })
  }
}

module.exports = {
  getVehicleDetail,
  buildManagementView,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory
}
