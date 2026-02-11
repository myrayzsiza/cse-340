const pool = require("../database/")

/* ****************************
 *  Place a new order
 **************************** */
async function placeOrder(accountId, invId, phone, address, city, state, zip, paymentAccount) {
  try {
    const sql = `
      INSERT INTO orders (account_id, inv_id, order_phone, order_address, order_city, order_state, order_zip, order_payment_account)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`

    const data = await pool.query(sql, [accountId, invId, phone, address, city, state, zip, paymentAccount])
    return data.rows[0]
  } catch (error) {
    console.error("placeOrder error: " + error)
    throw error
  }
}

/* ****************************
 *  Get order by order_id
 **************************** */
async function getOrderById(orderId) {
  try {
    const data = await pool.query(
      "SELECT o.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price FROM orders o JOIN inventory i ON o.inv_id = i.inv_id WHERE o.order_id = $1",
      [orderId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getOrderById error: " + error)
    throw error
  }
}

/* ****************************
 *  Get all orders by account_id
 **************************** */
async function getOrdersByAccountId(accountId) {
  try {
    const data = await pool.query(
      `SELECT o.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price 
       FROM orders o 
       JOIN inventory i ON o.inv_id = i.inv_id 
       WHERE o.account_id = $1
       ORDER BY o.order_date DESC`,
      [accountId]
    )
    return data.rows
  } catch (error) {
    console.error("getOrdersByAccountId error: " + error)
    throw error
  }
}

/* ****************************
 *  Update order status
 **************************** */
async function updateOrderStatus(orderId, status) {
  try {
    const sql = `
      UPDATE orders 
      SET order_status = $1
      WHERE order_id = $2
      RETURNING *`

    const data = await pool.query(sql, [status, orderId])
    return data.rowCount > 0
  } catch (error) {
    console.error("updateOrderStatus error: " + error)
    throw error
  }
}

/* ****************************
 *  Get all orders (admin)
 **************************** */
async function getAllOrders() {
  try {
    const data = await pool.query(
      `SELECT o.*, a.account_firstname, a.account_lastname, a.account_email, i.inv_make, i.inv_model, i.inv_year, i.inv_price 
       FROM orders o 
       JOIN account a ON o.account_id = a.account_id
       JOIN inventory i ON o.inv_id = i.inv_id 
       ORDER BY o.order_date DESC`
    )
    return data.rows
  } catch (error) {
    console.error("getAllOrders error: " + error)
    throw error
  }
}

module.exports = {
  placeOrder,
  getOrderById,
  getOrdersByAccountId,
  updateOrderStatus,
  getAllOrders
}
