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
