const pool = require("../database/")

/* ****************************
 *  Log user activity
 **************************** */
async function logActivity(accountId, actionType, description, ipAddress, userAgent) {
  try {
    await pool.query(
      `INSERT INTO activity_log (account_id, action_type, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [accountId, actionType, description, ipAddress, userAgent]
    )
  } catch (error) {
    console.error("logActivity error: " + error)
    throw error
  }
}

/* ****************************
 *  Get activity log for account
 **************************** */
async function getActivityByAccountId(accountId, limit = 50) {
  try {
    const data = await pool.query(
      `SELECT * FROM activity_log 
       WHERE account_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [accountId, limit]
    )
    return data.rows
  } catch (error) {
    console.error("getActivityByAccountId error: " + error)
    throw error
  }
}

/* ****************************
 *  Get all activity (admin only)
 **************************** */
async function getAllActivity(limit = 100) {
  try {
    const data = await pool.query(
      `SELECT a.*, ac.account_firstname, ac.account_lastname, ac.account_email
       FROM activity_log a
       JOIN account ac ON a.account_id = ac.account_id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    )
    return data.rows
  } catch (error) {
    console.error("getAllActivity error: " + error)
    throw error
  }
}

/* ****************************
 *  Get activity by date range
 **************************** */
async function getActivityByDateRange(startDate, endDate) {
  try {
    const data = await pool.query(
      `SELECT a.*, ac.account_firstname, ac.account_lastname, ac.account_email
       FROM activity_log a
       JOIN account ac ON a.account_id = ac.account_id
       WHERE a.created_at >= $1 AND a.created_at <= $2
       ORDER BY a.created_at DESC`,
      [startDate, endDate]
    )
    return data.rows
  } catch (error) {
    console.error("getActivityByDateRange error: " + error)
    throw error
  }
}

module.exports = {
  logActivity,
  getActivityByAccountId,
  getAllActivity,
  getActivityByDateRange,
}
