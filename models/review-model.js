const pool = require("../database/")

/* ****************************
 *  Add review
 **************************** */
async function addReview(inventoryId, accountId, rating, reviewText) {
  try {
    const data = await pool.query(
      `INSERT INTO reviews (inventory_id, account_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [inventoryId, accountId, rating, reviewText]
    )
    return data.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    throw error
  }
}

/* ****************************
 *  Get reviews for inventory
 **************************** */
async function getReviewsByInventoryId(inventoryId, approvedOnly = true) {
  try {
    const whereClause = approvedOnly ? "AND r.is_approved = true" : ""
    const data = await pool.query(
      `SELECT r.*, ac.account_firstname, ac.account_lastname
       FROM reviews r
       JOIN account ac ON r.account_id = ac.account_id
       WHERE r.inventory_id = $1 ${whereClause}
       ORDER BY r.created_at DESC`,
      [inventoryId]
    )
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    throw error
  }
}

/* ****************************
 *  Get average rating for inventory
 **************************** */
async function getAverageRating(inventoryId) {
  try {
    const data = await pool.query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
       FROM reviews
       WHERE inventory_id = $1 AND is_approved = true`,
      [inventoryId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    throw error
  }
}

/* ****************************
 *  Get review by account and inventory
 **************************** */
async function getReviewByAccountAndInventory(inventoryId, accountId) {
  try {
    const data = await pool.query(
      `SELECT * FROM reviews 
       WHERE inventory_id = $1 AND account_id = $2`,
      [inventoryId, accountId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getReviewByAccountAndInventory error: " + error)
    throw error
  }
}

/* ****************************
 *  Update review
 **************************** */
async function updateReview(reviewId, rating, reviewText) {
  try {
    const data = await pool.query(
      `UPDATE reviews 
       SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP
       WHERE review_id = $3
       RETURNING *`,
      [rating, reviewText, reviewId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error: " + error)
    throw error
  }
}

/* ****************************
 *  Delete review
 **************************** */
async function deleteReview(reviewId) {
  try {
    const data = await pool.query(
      "DELETE FROM reviews WHERE review_id = $1",
      [reviewId]
    )
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    throw error
  }
}

/* ****************************
 *  Get pending reviews (admin)
 **************************** */
async function getPendingReviews() {
  try {
    const data = await pool.query(
      `SELECT r.*, ac.account_firstname, ac.account_lastname, i.inv_make, i.inv_model
       FROM reviews r
       JOIN account ac ON r.account_id = ac.account_id
       JOIN inventory i ON r.inventory_id = i.inv_id
       WHERE r.is_approved = false
       ORDER BY r.created_at ASC`
    )
    return data.rows
  } catch (error) {
    console.error("getPendingReviews error: " + error)
    throw error
  }
}

/* ****************************
 *  Approve review (admin)
 **************************** */
async function approveReview(reviewId) {
  try {
    const data = await pool.query(
      `UPDATE reviews 
       SET is_approved = true
       WHERE review_id = $1
       RETURNING *`,
      [reviewId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("approveReview error: " + error)
    throw error
  }
}

/* ****************************
 *  Get review by ID
 **************************** */
async function getReviewById(reviewId) {
  try {
    const data = await pool.query(
      "SELECT * FROM reviews WHERE review_id = $1",
      [reviewId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    throw error
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getAverageRating,
  getReviewByAccountAndInventory,
  updateReview,
  deleteReview,
  getPendingReviews,
  approveReview,
  getReviewById,
}
