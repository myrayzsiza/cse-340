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

const pool = require('../database/') // adjust path to your DB connection

async function addClassification(name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1)'
    const data = await pool.query(sql, [name])
    return data.rowCount
  } catch (error) {
    console.error(error)
    return null
  }
}

async function addInventory(make, model, classification_id) {
  try {
    const sql = 'INSERT INTO inventory (inv_make, inv_model, classification_id) VALUES ($1, $2, $3)'
    const data = await pool.query(sql, [make, model, classification_id])
    return data.rowCount
  } catch (error) {
    console.error(error)
    return null
  }
}

async function getClassifications() {
  try {
    const sql = 'SELECT * FROM classification ORDER BY classification_name'
    const data = await pool.query(sql)
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports = { addClassification, addInventory, getClassifications }
