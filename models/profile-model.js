const pool = require("../database/")

/* ****************************
 *  Get profile by account_id
 **************************** */
async function getProfileByAccountId(accountId) {
  try {
    const data = await pool.query(
      "SELECT * FROM profiles WHERE account_id = $1",
      [accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getProfileByAccountId error: " + error)
    throw error
  }
}

/* ****************************
 *  Create new profile
 **************************** */
async function createProfile(accountId) {
  try {
    const data = await pool.query(
      "INSERT INTO profiles (account_id) VALUES ($1) RETURNING *",
      [accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("createProfile error: " + error)
    throw error
  }
}

/* ****************************
 *  Update profile
 **************************** */
async function updateProfile(accountId, profileData) {
  try {
    const {
      bio,
      phone_number,
      address,
      city,
      state,
      zip_code,
      profile_picture,
    } = profileData

    const data = await pool.query(
      `UPDATE profiles 
       SET bio = $1, phone_number = $2, address = $3, city = $4, state = $5, 
           zip_code = $6, profile_picture = $7, updated_at = CURRENT_TIMESTAMP
       WHERE account_id = $8
       RETURNING *`,
      [bio, phone_number, address, city, state, zip_code, profile_picture, accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("updateProfile error: " + error)
    throw error
  }
}

/* ****************************
 *  Delete profile
 **************************** */
async function deleteProfile(accountId) {
  try {
    const data = await pool.query(
      "DELETE FROM profiles WHERE account_id = $1",
      [accountId]
    )
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteProfile error: " + error)
    throw error
  }
}

module.exports = {
  getProfileByAccountId,
  createProfile,
  updateProfile,
  deleteProfile,
}
