function triggerError(req, res, next) {
  // Throw an intentional server error to be caught by error middleware
  throw new Error('Intentional server error')
}

module.exports = {
  triggerError,
}
