const { body, validationResult } = require('express-validator')
const Util = require('../utilities/')

// Rules: what we expect from the input
function classificationRules() {
  return [
    body('classification_name')
      .trim()
      .isAlphanumeric().withMessage('No spaces or special characters allowed')
      .notEmpty().withMessage('Classification name is required')
  ]
}

// Check: run the rules and handle errors
async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    return res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      errors: errors.array()
    })
  }
  next()
}

module.exports = { classificationRules, checkClassificationData }
