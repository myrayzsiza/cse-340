const pool = require("../database/")

/* ****************************
 *  Get all roles
 **************************** */
async function getAllRoles() {
  try {
    const data = await pool.query("SELECT * FROM roles ORDER BY role_id")
    return data.rows
  } catch (error) {
    console.error("getAllRoles error: " + error)
    throw error
  }
}

/* ****************************
 *  Get role by ID
 **************************** */
async function getRoleById(roleId) {
  try {
    const data = await pool.query("SELECT * FROM roles WHERE role_id = $1", [roleId])
    return data.rows[0]
  } catch (error) {
    console.error("getRoleById error: " + error)
    throw error
  }
}

/* ****************************
 *  Get all accounts with details (admin)
 **************************** */
async function getAllAccountsWithRoles() {
  try {
    const data = await pool.query(
      `SELECT a.*, r.role_name
       FROM account a
       LEFT JOIN roles r ON a.role_id = r.role_id
       ORDER BY a.account_id DESC`
    )
    return data.rows
  } catch (error) {
    console.error("getAllAccountsWithRoles error: " + error)
    throw error
  }
}

/* ****************************
 *  Update account role (admin)
 **************************** */
async function updateAccountRole(accountId, roleId) {
  try {
    const data = await pool.query(
      `UPDATE account 
       SET role_id = $1 
       WHERE account_id = $2 
       RETURNING *`,
      [roleId, accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("updateAccountRole error: " + error)
    throw error
  }
}

/* ****************************
 *  Check if user is admin
 **************************** */
async function isAdmin(accountId) {
  try {
    const data = await pool.query(
      `SELECT r.role_name FROM account a
       LEFT JOIN roles r ON a.role_id = r.role_id
       WHERE a.account_id = $1`,
      [accountId]
    )
    return data.rows[0] && data.rows[0].role_name === "Admin"
  } catch (error) {
    console.error("isAdmin error: " + error)
    throw error
  }
}

/* ****************************
 *  Count accounts by role
 **************************** */
async function countAccountsByRole() {
  try {
    const data = await pool.query(
      `SELECT r.role_name, COUNT(a.account_id) as count
       FROM roles r
       LEFT JOIN account a ON r.role_id = a.role_id
       GROUP BY r.role_id, r.role_name
       ORDER BY count DESC`
    )
    return data.rows
  } catch (error) {
    console.error("countAccountsByRole error: " + error)
    throw error
  }
}

module.exports = {
  getAllRoles,
  getRoleById,
  getAllAccountsWithRoles,
  updateAccountRole,
  isAdmin,
  countAccountsByRole,
}
