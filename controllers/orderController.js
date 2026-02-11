const orderModel = require("../models/order-model")
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")

const orderCont = {}

/* ***************************
 *  Show checkout form
 * ************************** */
orderCont.buildCheckoutForm = async function (req, res, next) {
  try {
    const { invId } = req.params
    const accountId = req.accountData.account_id
    
    // Get vehicle details
    const vehicle = await invModel.getInventoryById(invId)
    if (!vehicle) {
      return res.status(404).render("../errors/404", { 
        title: "Not Found", 
        nav: await utilities.getNav() 
      })
    }
    
    // Get account details
    const account = await accountModel.getAccountById(accountId)
    
    let nav = await utilities.getNav()
    res.render("./inventory/checkout", {
      title: "Checkout",
      nav,
      vehicle,
      account,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process order
 * ************************** */
orderCont.processOrder = async function (req, res, next) {
  try {
    const { invId } = req.params
    const { phone, address, city, state, zip } = req.body
    const accountId = req.accountData.account_id
    
    // Basic validation
    const errors = []
    if (!phone || phone.trim() === "") errors.push({ msg: "Phone number is required" })
    if (!address || address.trim() === "") errors.push({ msg: "Address is required" })
    if (!city || city.trim() === "") errors.push({ msg: "City is required" })
    if (!state || state.trim() === "") errors.push({ msg: "State is required" })
    if (!zip || zip.trim() === "") errors.push({ msg: "Zip code is required" })
    
    // If there are validation errors, re-render the form
    if (errors.length > 0) {
      const vehicle = await invModel.getInventoryById(invId)
      const account = await accountModel.getAccountById(accountId)
      let nav = await utilities.getNav()
      return res.render("./inventory/checkout", {
        title: "Checkout",
        nav,
        vehicle,
        account,
        errors,
        phone,
        address,
        city,
        state,
        zip,
      })
    }
    
    // Place the order
    const order = await orderModel.placeOrder(accountId, invId, phone, address, city, state, zip)
    
    req.flash("message", "Your order has been successfully placed!")
    res.redirect(`/order/confirmation/${order.order_id}`)
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Show order confirmation
 * ************************** */
orderCont.showConfirmation = async function (req, res, next) {
  try {
    const { orderId } = req.params
    const order = await orderModel.getOrderById(orderId)
    
    if (!order) {
      return res.status(404).render("../errors/404", { 
        title: "Not Found", 
        nav: await utilities.getNav() 
      })
    }
    
    // Verify the order belongs to the logged-in user
    if (order.account_id !== req.accountData.account_id) {
      return res.status(403).render("../errors/error", {
        title: "Access Denied",
        nav: await utilities.getNav(),
        message: "You do not have permission to view this order"
      })
    }
    
    let nav = await utilities.getNav()
    const message = req.flash("message")[0] || null
    
    res.render("./inventory/order-confirmation", {
      title: "Order Confirmation",
      nav,
      order,
      message,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Show order history
 * ************************** */
orderCont.showOrderHistory = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    const orders = await orderModel.getOrdersByAccountId(accountId)
    
    let nav = await utilities.getNav()
    res.render("./inventory/order-history", {
      title: "Order History",
      nav,
      orders,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = orderCont
