const { body, validationResult } = require('express-validator')

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
function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('inventory/add-classification', {
      errors: errors.array()
    })
  }
  next()
}

module.exports = { classificationRules, checkClassificationData }
