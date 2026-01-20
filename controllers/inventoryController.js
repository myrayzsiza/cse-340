const inventoryModel = require('../models/inventoryModel')
const utilities = require('../utilities')

async function getVehicleDetail(req, res, next) {
  try {
    const invId = req.params.invId
    const vehicle = await inventoryModel.getVehicleById(invId)

    if (!vehicle) {
      // Let 404 middleware handle missing vehicles
      return next()
    }

    // Build HTML snippet via utility and render the view
    const detailHtml = utilities.buildVehicleDetailHTML(vehicle)
    const pageTitle = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render('inventory/detail', { detailHtml, title: pageTitle })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getVehicleDetail,
}
