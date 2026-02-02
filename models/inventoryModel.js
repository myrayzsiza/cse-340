const { Pool } = require('pg')

// Pool configuration: prefer DATABASE_URL, fallback to individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

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
 * Example: Fetch all vehicles
 */
async function getAllVehicles() {
  const result = await pool.query('SELECT * FROM inventory')
  return result.rows
}

module.exports = {
  getVehicleById,
  getAllVehicles,
}
