# Shopping Cart System Documentation

## Overview

The shopping cart system allows users to add multiple vehicles to their cart, manage quantities, view their cart, and place multi-item orders.

## Features Implemented

### 1. **Add to Cart**

- Users can add vehicles to their cart from the inventory detail page
- **HTTP Endpoint:** `POST /cart/add/:invId`
- **Files:**
  - Controller: [cartController.js](./controllers/cartController.js)
  - Model: [cart-model.js](./models/cart-model.js)
  - Route: [cartRoute.js](./routes/cartRoute.js)

**Button Location:** Vehicle detail page includes both "Buy Now" and "Add to Cart" buttons

### 2. **View Shopping Cart**

- Users can view all items in their cart with prices and quantities
- **HTTP Endpoint:** `GET /cart/view`
- **View File:** [views/inventory/cart.ejs](./views/inventory/cart.ejs)
- **Features:**
  - Display vehicle thumbnail, details, price
  - View quantity for each item
  - See subtotal for each vehicle
  - View total cart value
  - Option to continue shopping or proceed to checkout

### 3. **Remove Items from Cart**

- Users can remove individual items from their cart
- **HTTP Endpoint:** `GET /cart/remove/:cartId`
- **Implementation:**
  - Security verified: Items can only be removed if they belong to the logged-in user
  - Redirects back to cart view with confirmation message

### 4. **Update Quantities**

- Users can change the quantity of items in their cart via AJAX
- **HTTP Endpoint:** `POST /cart/update-quantity/:cartId`
- **Features:**
  - Real-time updates without page reload
  - Validates quantity (must be ≥ 1)
  - Returns updated cart total
  - Security verified: User ownership confirmed

### 5. **Clear Cart**

- Users can clear their entire cart at once
- **HTTP Endpoint:** `GET /cart/clear`
- **Features:**
  - Confirmation message displayed
  - Removes all items for the user

### 6. **Checkout from Cart**

- Multi-item checkout process
- **HTTP Endpoint:** `GET /cart/checkout`
- **View File:** [views/inventory/checkout-cart.ejs](./views/inventory/checkout-cart.ejs)
- **Features:**
  - Display all cart items with totals
  - Collect shipping and payment information
  - Form validation for required fields
  - Pre-populate fields from user account if available

### 7. **Process Multi-Item Orders**

- Create individual orders for each cart item
- **HTTP Endpoint:** `POST /cart/process`
- **Implementation:**
  - Validates shipping information
  - Creates separate order for each vehicle
  - Clears cart after successful order
  - Redirects to order confirmation

### 8. **Order Confirmation for Cart Orders**

- Display confirmation for multiple orders
- **HTTP Endpoint:** `GET /cart/order-confirmation`
- **View File:** [views/inventory/order-confirmation-cart.ejs](./views/inventory/order-confirmation-cart.ejs)
- **Features:**
  - Show all ordered vehicles
  - Display order numbers and statuses
  - Show shipping details
  - Summary of total items and cost
  - Links to view all orders or continue shopping

## Database Schema

### Cart Table

```sql
CREATE TABLE public.cart (
  cart_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL (FK),
  inv_id INTEGER NOT NULL (FK),
  quantity INTEGER DEFAULT 1,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (account_id, inv_id)
);
```

**Indexes:**

- `idx_cart_account_id` - Fast lookups by user
- `idx_cart_inv_id` - Fast lookups by vehicle

**Constraints:**

- Foreign key to account (CASCADE on delete)
- Foreign key to inventory (CASCADE on delete)
- Unique constraint: Each user can have max 1 cart entry per vehicle (quantity increases instead)

### Updated Orders Table

New columns added to support multi-item orders:

- `order_total_price NUMERIC(10, 2)` - Total price for the order
- `order_total_items INTEGER DEFAULT 1` - Number of items in order

## User Interface

### Navigation Header

- Added "🛒 Cart" link in header (visible to logged-in users)
- Click to view shopping cart

### Vehicle Detail Page

- **"Buy Now" Button** - Checkout single item directly
- **"Add to Cart" Button** - Add item to cart with quantity selector
  - Prompts user for quantity
  - Updates cart count
  - Shows success message

### Cart Page Flow

```
View Cart → Update Quantities → Checkout → Shipping Info → Confirmation
    ↓
Remove Items or Continue Shopping
```

## API Endpoints

| Method | Endpoint                        | Description              | Auth Required |
| ------ | ------------------------------- | ------------------------ | ------------- |
| GET    | `/cart/view`                    | View shopping cart       | Yes           |
| POST   | `/cart/add/:invId`              | Add item to cart (AJAX)  | Yes           |
| GET    | `/cart/remove/:cartId`          | Remove item from cart    | Yes           |
| POST   | `/cart/update-quantity/:cartId` | Update quantity (AJAX)   | Yes           |
| GET    | `/cart/clear`                   | Clear entire cart        | Yes           |
| GET    | `/cart/checkout`                | Show checkout form       | Yes           |
| POST   | `/cart/process`                 | Process cart order       | Yes           |
| GET    | `/cart/confirm-order`           | Confirm multi-item order | Yes           |
| GET    | `/cart/order-confirmation`      | Show order confirmation  | Yes           |

## Security Features

1. **Authentication Required**
   - All cart endpoints require login
   - Uses `checkLogin` middleware

2. **User Ownership Verification**
   - Cart items can only be accessed by their owner
   - Account ID is verified before item removal or quantity updates
   - Orders can only be viewed by the user who placed them

3. **Input Validation**
   - Quantity must be positive integer
   - All form inputs validated and sanitized
   - Empty cart redirects to cart view

## Model Methods (cart-model.js)

```javascript
// Add or update item in cart
addToCart(accountId, invId, (quantity = 1));

// Get all cart items for user
getCartByAccountId(accountId);

// Get single cart item
getCartItemById(cartId);

// Update quantity of cart item
updateCartQuantity(cartId, quantity);

// Remove item from cart
removeFromCart(cartId);

// Clear entire cart
clearCart(accountId);

// Get count of items in cart
getCartItemCount(accountId);

// Get total price of cart
getCartTotal(accountId);
```

## Controller Methods (cartController.js)

```javascript
// Add item to cart
addToCart(req, res, next);

// View cart page
viewCart(req, res, next);

// Remove item from cart
removeFromCart(req, res, next);

// Update item quantity
updateQuantity(req, res, next);

// Show checkout form
buildCheckoutForm(req, res, next);

// Process checkout
processOrderFromCart(req, res, next);

// Confirm order
confirmOrder(req, res, next);

// Show order confirmation page
showOrderConfirmation(req, res, next);

// Clear entire cart
clearCart(req, res, next);
```

## Testing Checklist

- [ ] Login to account
- [ ] Browse inventory
- [ ] Add vehicle to cart with quantity
- [ ] View cart and see all items
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Proceed to checkout
- [ ] Fill in shipping information
- [ ] Complete order
- [ ] View order confirmation with all vehicles
- [ ] Check order history shows all orders
- [ ] Clear cart and verify empty state
- [ ] Test adding multiple different vehicles
- [ ] Verify cart total calculation

## Related Features

### Order History (Updated)

- Users can view all orders from [/order/history](./views/inventory/order-history.ejs)
- Each cart order creates individual order records
- All orders visible in the orders table

### Order Confirmation (Single Item)

- Existing endpoint for single-item orders: `/order/confirmation/:orderId`
- File: [views/inventory/order-confirmation.ejs](./views/inventory/order-confirmation.ejs)

## Migration Files

- **008_add_cart_system.sql** - Creates cart table, adds columns to orders table

## Directory Structure

```
controllers/
  ├── cartController.js (NEW)
  └── orderController.js (existing)

models/
  ├── cart-model.js (NEW)
  └── order-model.js (existing)

routes/
  ├── cartRoute.js (NEW)
  └── orderRoute.js (existing)

views/inventory/
  ├── cart.ejs (NEW)
  ├── checkout-cart.ejs (NEW)
  ├── order-confirmation-cart.ejs (NEW)
  ├── checkout.ejs (existing)
  └── order-confirmation.ejs (existing)

database/migrations/
  └── 008_add_cart_system.sql (NEW)
```

## Files Modified

1. **server.js**
   - Added cart route require statement
   - Added cart route mounting

2. **utilities/index.js**
   - Updated `buildSingleVehicleDisplay()` to include "Add to Cart" button
   - Added onchange handlers for cart functionality

3. **views/partials/header.ejs**
   - Added cart link to navigation for logged-in users

## Notes

- Cart items are stored per-user and persist across sessions
- When adding duplicate item to cart, quantity is incremented instead of creating duplicate entry
- Images in cart view use the vehicle's inventory image path
- All prices are formatted using US currency locale
- Cart is cleared automatically after successful order placement
