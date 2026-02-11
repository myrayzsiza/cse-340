const cartModel = require("../models/cart-model")
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")

const cartCont = {}

/* ***************************
 *  Add item to cart
 * ************************** */
cartCont.addToCart = async function (req, res, next) {
  try {
    const { invId } = req.params
    const accountId = req.accountData.account_id
    const quantity = parseInt(req.body.quantity) || 1
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" })
    }
    
    // Verify vehicle exists
    const vehicle = await invModel.getInventoryById(invId)
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" })
    }
    
    // Add to cart
    await cartModel.addToCart(accountId, invId, quantity)
    const cartCount = await cartModel.getCartItemCount(accountId)
    
    res.json({ 
      success: true, 
      message: "Vehicle added to cart",
      cartCount: cartCount 
    })
  } catch (error) {
    console.error("addToCart error:", error)
    res.status(500).json({ success: false, message: "Error adding to cart" })
  }
}

/* ***************************
 *  View cart
 * ************************** */
cartCont.viewCart = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    
    const cartItems = await cartModel.getCartByAccountId(accountId)
    const cartTotal = await cartModel.getCartTotal(accountId)
    
    let nav = await utilities.getNav()
    res.render("./inventory/cart", {
      title: "Shopping Cart",
      nav,
      cartItems,
      cartTotal,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Remove item from cart
 * ************************** */
cartCont.removeFromCart = async function (req, res, next) {
  try {
    const { cartId } = req.params
    const accountId = req.accountData.account_id
    
    // Verify the cart item belongs to the user
    const cartItem = await cartModel.getCartItemById(cartId)
    if (!cartItem || cartItem.account_id !== accountId) {
      req.flash("error", "Item not found in your cart")
      return res.redirect("/cart/view")
    }
    
    await cartModel.removeFromCart(cartId)
    req.flash("message", "Item removed from cart")
    res.redirect("/cart/view")
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update cart item quantity
 * ************************** */
cartCont.updateQuantity = async function (req, res, next) {
  try {
    const { cartId } = req.params
    const { quantity } = req.body
    const accountId = req.accountData.account_id
    const newQuantity = parseInt(quantity)
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" })
    }
    
    const cartItem = await cartModel.getCartItemById(cartId)
    if (!cartItem || cartItem.account_id !== accountId) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
    }
    
    await cartModel.updateCartQuantity(cartId, newQuantity)
    const cartTotal = await cartModel.getCartTotal(accountId)
    
    res.json({ 
      success: true, 
      message: "Quantity updated",
      newTotal: cartTotal
    })
  } catch (error) {
    console.error("updateQuantity error:", error)
    res.status(500).json({ success: false, message: "Error updating quantity" })
  }
}

/* ***************************
 *  Build checkout from cart
 * ************************** */
cartCont.buildCheckoutForm = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    
    // Get cart items
    const cartItems = await cartModel.getCartByAccountId(accountId)
    if (cartItems.length === 0) {
      req.flash("error", "Your cart is empty")
      return res.redirect("/cart/view")
    }
    
    // Get account details
    const account = await accountModel.getAccountById(accountId)
    const cartTotal = await cartModel.getCartTotal(accountId)
    
    let nav = await utilities.getNav()
    res.render("./inventory/checkout-cart", {
      title: "Checkout",
      nav,
      cartItems,
      cartTotal,
      account,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process order from cart
 * ************************** */
cartCont.processOrderFromCart = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    const { phone, address, city, state, zip, payment_account } = req.body
    
    // Get cart items
    const cartItems = await cartModel.getCartByAccountId(accountId)
    if (cartItems.length === 0) {
      req.flash("error", "Your cart is empty")
      return res.redirect("/cart/view")
    }
    
    // Basic validation
    const errors = []
    if (!phone || phone.trim() === "") errors.push({ msg: "Phone number is required" })
    if (!address || address.trim() === "") errors.push({ msg: "Address is required" })
    if (!city || city.trim() === "") errors.push({ msg: "City is required" })
    if (!state || state.trim() === "") errors.push({ msg: "State is required" })
    if (!zip || zip.trim() === "") errors.push({ msg: "Zip code is required" })
    if (!payment_account || payment_account.trim() === "") errors.push({ msg: "Payment account number is required" })
    
    // If there are validation errors, re-render the form
    if (errors.length > 0) {
      const account = await accountModel.getAccountById(accountId)
      const cartTotal = await cartModel.getCartTotal(accountId)
      let nav = await utilities.getNav()
      return res.render("./inventory/checkout-cart", {
        title: "Checkout",
        nav,
        cartItems,
        cartTotal,
        account,
        errors,
        phone,
        address,
        city,
        state,
        zip,
        payment_account,
      })
    }
    
    // Store order details in session for confirmation
    req.session.pendingOrder = {
      accountId,
      cartItems,
      phone,
      address,
      city,
      state,
      zip,
      payment_account,
      totalPrice: await cartModel.getCartTotal(accountId)
    }
    
    res.redirect("/cart/confirm-order")
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Confirm order from cart
 * ************************** */
cartCont.confirmOrder = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    const orderData = req.session.pendingOrder
    
    if (!orderData || orderData.accountId !== accountId) {
      req.flash("error", "Session expired, please checkout again")
      return res.redirect("/cart/view")
    }
    
    const orderModel = require("../models/order-model")
    
    // Create orders for each item in cart
    const orderIds = []
    let totalPrice = 0
    let totalItems = 0
    
    for (const item of orderData.cartItems) {
      const order = await orderModel.placeOrder(
        accountId,
        item.inv_id,
        orderData.phone,
        orderData.address,
        orderData.city,
        orderData.state,
        orderData.zip,
        orderData.payment_account
      )
      orderIds.push(order.order_id)
      totalPrice += item.inv_price * item.quantity
      totalItems += item.quantity
    }
    
    // Clear the cart
    await cartModel.clearCart(accountId)
    
    // Clear session
    delete req.session.pendingOrder
    
    req.flash("message", `Order placed successfully! ${totalItems} vehicle(s) ordered.`)
    res.redirect(`/cart/order-confirmation?orders=${orderIds.join(',')}`)
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Show order confirmation
 * ************************** */
cartCont.showOrderConfirmation = async function (req, res, next) {
  try {
    const orderIds = req.query.orders ? req.query.orders.split(',').map(id => parseInt(id)) : []
    const accountId = req.accountData.account_id
    
    if (orderIds.length === 0) {
      return res.status(404).render("../errors/404", { 
        title: "Not Found", 
        nav: await utilities.getNav() 
      })
    }
    
    const orderModel = require("../models/order-model")
    const orders = []
    
    for (const orderId of orderIds) {
      const order = await orderModel.getOrderById(orderId)
      if (order && order.account_id === accountId) {
        orders.push(order)
      }
    }
    
    if (orders.length === 0) {
      return res.status(403).render("../errors/error", {
        title: "Access Denied",
        nav: await utilities.getNav(),
        message: "You do not have permission to view this order"
      })
    }
    
    let nav = await utilities.getNav()
    const message = req.flash("message")[0] || null
    const totalPrice = orders.reduce((sum, order) => sum + (order.inv_price * 1), 0)
    
    res.render("./inventory/order-confirmation-cart", {
      title: "Order Confirmation",
      nav,
      orders,
      message,
      totalPrice
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Clear entire cart
 * ************************** */
cartCont.clearCart = async function (req, res, next) {
  try {
    const accountId = req.accountData.account_id
    await cartModel.clearCart(accountId)
    req.flash("message", "Cart cleared")
    res.redirect("/cart/view")
  } catch (error) {
    next(error)
  }
}

module.exports = cartCont
