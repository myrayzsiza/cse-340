const { body, validationResult } = require('express-validator')
const Util = require('../utilities/') // adjust path if needed

// Rules
function inventoryRules() {
  return [
    body('inv_make').trim().notEmpty().withMessage('Make is required'),
    body('inv_model').trim().notEmpty().withMessage('Model is required'),
    body('classification_id').notEmpty().withMessage('Classification is required')
  ]
}

// Check
async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const classificationSelect = await Util.buildClassificationList(req.body.classification_id)
    return res.render('inventory/add-inventory', {
      errors: errors.array(),
      ...req.body, // keeps sticky values
      classificationSelect
    })
  }
  next()
}

module.exports = { inventoryRules, checkInventoryData }
