const pool = require("../database/")

/* ****************************
 *  Search inventory
 **************************** */
async function searchInventory(searchTerm) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory 
       WHERE LOWER(inv_make) ILIKE LOWER($1) 
          OR LOWER(inv_model) ILIKE LOWER($1)
          OR LOWER(inv_description) ILIKE LOWER($1)
       ORDER BY inv_make, inv_model`,
      [`%${searchTerm}%`]
    )
    return data.rows
  } catch (error) {
    console.error("searchInventory error: " + error)
    throw error
  }
}

/* ****************************
 *  Filter inventory by make
 **************************** */
async function filterByMake(make) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory 
       WHERE LOWER(inv_make) = LOWER($1)
       ORDER BY inv_model`,
      [make]
    )
    return data.rows
  } catch (error) {
    console.error("filterByMake error: " + error)
    throw error
  }
}

/* ****************************
 *  Filter inventory by year range
 **************************** */
async function filterByYearRange(minYear, maxYear) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory 
       WHERE inv_year >= $1 AND inv_year <= $2
       ORDER BY inv_year DESC, inv_make, inv_model`,
      [minYear, maxYear]
    )
    return data.rows
  } catch (error) {
    console.error("filterByYearRange error: " + error)
    throw error
  }
}

/* ****************************
 *  Advanced search with multiple filters
 **************************** */
async function advancedSearch(filters) {
  try {
    let query = "SELECT * FROM inventory WHERE 1=1"
    const params = []
    let paramCount = 1

    if (filters.make) {
      query += ` AND LOWER(inv_make) ILIKE LOWER($${paramCount})`
      params.push(`%${filters.make}%`)
      paramCount++
    }

    if (filters.model) {
      query += ` AND LOWER(inv_model) ILIKE LOWER($${paramCount})`
      params.push(`%${filters.model}%`)
      paramCount++
    }

    if (filters.minYear && filters.maxYear) {
      query += ` AND inv_year >= $${paramCount} AND inv_year <= $${paramCount + 1}`
      params.push(filters.minYear, filters.maxYear)
      paramCount += 2
    }

    if (filters.minPrice && filters.maxPrice) {
      query += ` AND inv_price >= $${paramCount} AND inv_price <= $${paramCount + 1}`
      params.push(filters.minPrice, filters.maxPrice)
      paramCount += 2
    }

    query += " ORDER BY inv_year DESC, inv_make, inv_model"

    const data = await pool.query(query, params)
    return data.rows
  } catch (error) {
    console.error("advancedSearch error: " + error)
    throw error
  }
}

/* ****************************
 *  Get distinct makes
 **************************** */
async function getDistinctMakes() {
  try {
    const data = await pool.query(
      "SELECT DISTINCT inv_make FROM inventory ORDER BY inv_make"
    )
    return data.rows
  } catch (error) {
    console.error("getDistinctMakes error: " + error)
    throw error
  }
}

module.exports = {
  searchInventory,
  filterByMake,
  filterByYearRange,
  advancedSearch,
  getDistinctMakes,
}
