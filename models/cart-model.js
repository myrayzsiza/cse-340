const pool = require("../database/")

/* ****************************
 *  Add item to cart
 **************************** */
async function addToCart(accountId, invId, quantity = 1) {
  try {
    // Check if item already in cart
    const existingItem = await pool.query(
      "SELECT * FROM cart WHERE account_id = $1 AND inv_id = $2",
      [accountId, invId]
    )
    
    if (existingItem.rows.length > 0) {
      // Update quantity if already exists
      const newQuantity = existingItem.rows[0].quantity + quantity
      const data = await pool.query(
        "UPDATE cart SET quantity = $1 WHERE account_id = $2 AND inv_id = $3 RETURNING *",
        [newQuantity, accountId, invId]
      )
      return data.rows[0]
    } else {
      // Insert new cart item
      const data = await pool.query(
        "INSERT INTO cart (account_id, inv_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [accountId, invId, quantity]
      )
      return data.rows[0]
    }
  } catch (error) {
    console.error("addToCart error: " + error)
    throw error
  }
}

/* ****************************
 *  Get cart items by account ID
 **************************** */
async function getCartByAccountId(accountId) {
  try {
    const data = await pool.query(
      `SELECT c.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_image
       FROM cart c
       JOIN inventory i ON c.inv_id = i.inv_id
       WHERE c.account_id = $1
       ORDER BY c.added_date DESC`,
      [accountId]
    )
    return data.rows
  } catch (error) {
    console.error("getCartByAccountId error: " + error)
    throw error
  }
}

/* ****************************
 *  Get single cart item
 **************************** */
async function getCartItemById(cartId) {
  try {
    const data = await pool.query(
      `SELECT c.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price
       FROM cart c
       JOIN inventory i ON c.inv_id = i.inv_id
       WHERE c.cart_id = $1`,
      [cartId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getCartItemById error: " + error)
    throw error
  }
}

/* ****************************
 *  Update cart item quantity
 **************************** */
async function updateCartQuantity(cartId, quantity) {
  try {
    // Can't have quantity less than 1
    if (quantity < 1) {
      return removeFromCart(cartId)
    }
    
    const data = await pool.query(
      "UPDATE cart SET quantity = $1 WHERE cart_id = $2 RETURNING *",
      [quantity, cartId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("updateCartQuantity error: " + error)
    throw error
  }
}

/* ****************************
 *  Remove item from cart
 **************************** */
async function removeFromCart(cartId) {
  try {
    const data = await pool.query(
      "DELETE FROM cart WHERE cart_id = $1 RETURNING *",
      [cartId]
    )
    return data.rowCount > 0
  } catch (error) {
    console.error("removeFromCart error: " + error)
    throw error
  }
}

/* ****************************
 *  Clear entire cart
 **************************** */
async function clearCart(accountId) {
  try {
    const data = await pool.query(
      "DELETE FROM cart WHERE account_id = $1",
      [accountId]
    )
    return data.rowCount
  } catch (error) {
    console.error("clearCart error: " + error)
    throw error
  }
}

/* ****************************
 *  Get cart item count
 **************************** */
async function getCartItemCount(accountId) {
  try {
    const data = await pool.query(
      "SELECT COUNT(*) as count FROM cart WHERE account_id = $1",
      [accountId]
    )
    return parseInt(data.rows[0].count)
  } catch (error) {
    console.error("getCartItemCount error: " + error)
    throw error
  }
}

/* ****************************
 *  Get cart total price
 **************************** */
async function getCartTotal(accountId) {
  try {
    const data = await pool.query(
      `SELECT COALESCE(SUM(i.inv_price * c.quantity), 0) as total
       FROM cart c
       JOIN inventory i ON c.inv_id = i.inv_id
       WHERE c.account_id = $1`,
      [accountId]
    )
    return parseFloat(data.rows[0].total)
  } catch (error) {
    console.error("getCartTotal error: " + error)
    throw error
  }
}

module.exports = {
  addToCart,
  getCartByAccountId,
  getCartItemById,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal
}
