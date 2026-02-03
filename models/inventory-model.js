const pool = require("../database")

/**
 * Fetch a single vehicle by id using a prepared statement
 * @param {number|string} invId
 */
async function getVehicleById(invId) {
  const result = await pool.query(
    'SELECT * FROM inventory WHERE inv_id = $1',
    [invId]
  )
  return result.rows[0]
}

/**
 * Fetch all vehicles
 */
async function getAllVehicles() {
  const result = await pool.query('SELECT * FROM inventory')
  return result.rows
}

/**
 * Insert a new classification
 * @param {string} classification_name
 * @returns {Promise<object>} Insert result
 */
async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *'
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/**
 * Fetch all classifications
 */
async function getClassifications() {
  return pool.query('SELECT * FROM classification ORDER BY classification_name')
}

/**
 * Insert a new inventory item
 * @param {string} inv_make
 * @param {string} inv_model
 * @param {number} classification_id
 */
async function addInventoryItem(inv_make, inv_model, classification_id) {
  const sql = `
    INSERT INTO inventory (inv_make, inv_model, classification_id)
    VALUES ($1, $2, $3) RETURNING *
  `
  const result = await pool.query(sql, [inv_make, inv_model, classification_id])
  return result.rows[0]
}

module.exports = {
  getVehicleById,
  getAllVehicles,
  addClassification,
  getClassifications,
  addInventoryItem
}
