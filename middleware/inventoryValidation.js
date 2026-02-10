const { body, validationResult } = require('express-validator')
const Util = require('../utilities/') // adjust path if needed

// Rules
function inventoryRules() {
  return [
    body('inv_make').trim().notEmpty().withMessage('Make is required'),
    body('inv_model').trim().notEmpty().withMessage('Model is required'),
    body('inv_year').trim().notEmpty().withMessage('Year is required').isNumeric().withMessage('Year must be a number'),
    body('inv_description').trim().notEmpty().withMessage('Description is required'),
    body('inv_image').trim().notEmpty().withMessage('Image URL is required'),
    body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail URL is required'),
    body('inv_price').notEmpty().withMessage('Price is required').isNumeric().withMessage('Price must be a number'),
    body('inv_miles').notEmpty().withMessage('Mileage is required').isNumeric().withMessage('Mileage must be a number'),
    body('inv_color').trim().notEmpty().withMessage('Color is required'),
    body('classification_id').notEmpty().withMessage('Classification is required')
  ]
}

// Check
async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    const classificationSelect = await Util.buildClassificationList(req.body.classification_id)
    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      nav,
      errors: errors.array(),
      classificationSelect,
      ...req.body, // keeps sticky values
    })
  }
  next()
}

module.exports = { inventoryRules, checkInventoryData }
