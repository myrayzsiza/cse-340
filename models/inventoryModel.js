const { Pool } = require('pg')

// Pool configuration: prefer DATABASE_URL, fallback to individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * Fetch a single vehicle by id using a prepared statement
 * @param {number|string} invId
 * @returns {Promise<Object|null>} vehicle row or null
 */
async function getVehicleById(invId) {
  const sql = `SELECT * FROM inventory WHERE inv_id = $1` // prepared statement
  try {
    const result = await pool.query(sql, [invId])
    if (result.rowCount > 0) return result.rows[0]
    return null
  } catch (err) {
    throw err
  }
}

module.exports = {
  getVehicleById,
}
