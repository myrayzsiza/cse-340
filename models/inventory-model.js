const { Pool } = require('pg')

// Pool configuration: prefer DATABASE_URL, fallback to individual env vars
const isProduction = process.env.NODE_ENV === 'production';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

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


/**
 * Insert a new classification
 * @param {string} classification_name
 * @returns {Promise<object>} Insert result
 */
async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *';
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    return null;
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
 * @returns {Promise<object>} Insert result
 */
async function addInventory(inv_make, inv_model, classification_id) {
  try {
    const sql = `INSERT INTO inventory (inv_make, inv_model, classification_id, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES ($1, $2, $3, '2026', 'Default description', '/images/vehicles/default.png', '/images/vehicles/default-thumb.png', 10000, 0, 'Black') RETURNING *`;
    const result = await pool.query(sql, [inv_make, inv_model, classification_id]);
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

module.exports = {
  getVehicleById,
  getAllVehicles,
  addClassification,
  getClassifications,
  addInventory,
}

const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get inventory and classification data by inv_id
 *   * ************************** */
async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error(error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId,getInventoryById};