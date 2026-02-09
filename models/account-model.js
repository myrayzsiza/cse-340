const pool = require("../database/")

/* ****************************
 *  Get account by account_id
 **************************** */
async function getAccountById(accountId) {
  try {
    const data = await pool.query(
      "SELECT * FROM account WHERE account_id = $1",
      [accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAccountById error: " + error)
    throw error
  }
}

/* ****************************
 *  Update account information
 **************************** */
async function updateAccountInfo(accountId, firstName, lastName, email) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3
      WHERE account_id = $4
      RETURNING *`

    const data = await pool.query(sql, [firstName, lastName, email, accountId])
    return data.rowCount > 0
  } catch (error) {
    console.error("updateAccountInfo error: " + error)
    throw error
  }
}

/* ****************************
 *  Update account password
 **************************** */
async function updatePassword(accountId, hashedPassword) {
  try {
    const sql = `
      UPDATE account 
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *`

    const data = await pool.query(sql, [hashedPassword, accountId])
    return data.rowCount > 0
  } catch (error) {
    console.error("updatePassword error: " + error)
    throw error
  }
}

module.exports = {
  getAccountById,
  updateAccountInfo,
  updatePassword,
}
