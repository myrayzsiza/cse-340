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
 *  Get account by email
 **************************** */
async function getAccountByEmail(email) {
  try {
    const data = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [email]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error: " + error)
    throw error
  }
}

/* ****************************
 *  Register new account
 **************************** */
async function registerAccount(firstName, lastName, email, hashedPassword) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *`

    const data = await pool.query(sql, [firstName, lastName, email, hashedPassword])
    return data.rowCount > 0
  } catch (error) {
    console.error("registerAccount error: " + error)
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

/* ****************************
 *  Save password reset token
 **************************** */
async function saveResetToken(email, resetToken, expiresAt) {
  try {
    const sql = `
      UPDATE account 
      SET reset_token = $1, reset_token_expires = $2
      WHERE account_email = $3
      RETURNING *`

    const data = await pool.query(sql, [resetToken, expiresAt, email])
    return data.rowCount > 0
  } catch (error) {
    console.error("saveResetToken error: " + error)
    throw error
  }
}

/* ****************************
 *  Get account by reset token
 **************************** */
async function getAccountByResetToken(resetToken) {
  try {
    const sql = `
      SELECT * FROM account 
      WHERE reset_token = $1 
      AND reset_token_expires > NOW()
      LIMIT 1`

    const data = await pool.query(sql, [resetToken])
    return data.rows[0]
  } catch (error) {
    console.error("getAccountByResetToken error: " + error)
    throw error
  }
}

/* ****************************
 *  Clear reset token
 **************************** */
async function clearResetToken(accountId) {
  try {
    const sql = `
      UPDATE account 
      SET reset_token = NULL, reset_token_expires = NULL
      WHERE account_id = $1
      RETURNING *`

    const data = await pool.query(sql, [accountId])
    return data.rowCount > 0
  } catch (error) {
    console.error("clearResetToken error: " + error)
    throw error
  }
}

module.exports = {
  getAccountById,
  getAccountByEmail,
  registerAccount,
  updateAccountInfo,
  updatePassword,
  saveResetToken,
  getAccountByResetToken,
  clearResetToken,
}
