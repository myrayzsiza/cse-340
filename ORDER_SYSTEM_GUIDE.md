# Order Checkout System Implementation Guide

## Overview

This document describes the order checkout system that has been implemented for your CSE-340 vehicle dealership application. When a logged-in user clicks the "Order Now" button on a vehicle detail page, they will be directed through a checkout process where they enter their delivery information, and upon confirmation, receive an order confirmation message.

## Features Implemented

### 1. **Order Button on Vehicle Detail Page**

- When a user is **logged in**, they see an "Order Now" button
- When a user is **not logged in**, they see a "Login to Order" button
- The button is styled with a professional blue button design

### 2. **Checkout Form** (`/order/checkout/:invId`)

- Users enter their delivery and contact information:
  - Phone number
  - Street address
  - City
  - State
  - Zip code
- The form displays:
  - Order summary with vehicle details and price
  - Current account information (name and email)
  - Pre-filled form fields if available
- Form validation with error messages
- Authenticated users only (redirects to login if not authenticated)

### 3. **Order Confirmation Page** (`/order/confirmation/:orderId`)

- Displays a success message: **"Your Order Has Been Successfully Placed!"**
- Shows complete order details:
  - Order number
  - Vehicle information
  - Price
  - Order date and time
  - Order status
  - Delivery information
- Provides "What Happens Next?" section explaining the process
- Links to view all orders or continue shopping

### 4. **Order History** (`/order/history`)

- Users can view all their past orders in a table format
- Shows order number, vehicle, price, date, and status
- Click "View Details" to see full order information

## Database Schema

### Orders Table

```sql
CREATE TABLE public.orders (
  order_id INTEGER PRIMARY KEY (auto-generated),
  account_id INTEGER (Foreign Key to account),
  inv_id INTEGER (Foreign Key to inventory),
  order_phone CHARACTER VARYING,
  order_address CHARACTER VARYING,
  order_city CHARACTER VARYING,
  order_state CHARACTER VARYING,
  order_zip CHARACTER VARYING,
  order_date TIMESTAMP (defaults to current time),
  order_status CHARACTER VARYING (default: 'Pending')
);
```

### Account Table Updates

The following columns have been added to the account table:

- `account_phone` - User's phone number
- `account_address` - User's street address
- `account_city` - User's city
- `account_state` - User's state
- `account_zip` - User's postal code

## File Structure

### Routes

- **[routes/orderRoute.js](routes/orderRoute.js)** - All order-related routes

### Controllers

- **[controllers/orderController.js](controllers/orderController.js)** - Order business logic
  - `buildCheckoutForm()` - Display checkout form
  - `processOrder()` - Handle form submission
  - `showConfirmation()` - Display order confirmation
  - `showOrderHistory()` - Display user's order history

### Models

- **[models/order-model.js](models/order-model.js)** - Database queries
  - `placeOrder()` - Create new order
  - `getOrderById()` - Retrieve order details
  - `getOrdersByAccountId()` - Get user's orders
  - `updateOrderStatus()` - Update order status
  - `getAllOrders()` - Get all orders (admin)

### Views

- **[views/inventory/checkout.ejs](views/inventory/checkout.ejs)** - Checkout form
- **[views/inventory/order-confirmation.ejs](views/inventory/order-confirmation.ejs)** - Order confirmation page
- **[views/inventory/order-history.ejs](views/inventory/order-history.ejs)** - Order history page

### Database

- **[database/migrations/006_add_orders.sql](database/migrations/006_add_orders.sql)** - Migration file
- Updated **[database/rebuild.sql](database/rebuild.sql)** - Includes orders table creation

## Setting Up the Order System

### Step 1: Update Your Database

Run the migration file to create the orders table and update the account table:

**Option A: Using a PostgreSQL client**

```bash
# Connect to your database and run:
\i database/rebuild.sql
# or
\i database/migrations/006_add_orders.sql
```

**Option B: Using command line**

```bash
psql -U <username> -d <database_name> -f database/rebuild.sql
```

### Step 2: Restart Your Application

```bash
npm run dev
```

### Step 3: Test the Feature

1. Log in to your application
2. Navigate to any vehicle detail page
3. Click the "Order Now" button
4. Fill out the checkout form with:
   - Phone number
   - Address
   - City
   - State
   - Zip code
5. Click "Confirm Order"
6. You should see the order confirmation page with the message: **"Your Order Has Been Successfully Placed!"**

## User Flow

```
Vehicle Detail Page
      ↓
[Is user logged in?]
  ├─ YES → "Order Now" button
  │         ↓
  │    Checkout Form (/order/checkout/:invId)
  │         ↓
  │    Form Validation
  │         ↓
  │    Place Order (database insert)
  │         ↓
  │    Order Confirmation (/order/confirmation/:orderId)
  │         ↓
  │    "Your order has been successfully placed!"
  │
  └─ NO → "Login to Order" button
          ↓
       Account Login Page
```

## Order Status Workflow

When an order is created, it has the following status: `Pending`

Admin users can later update order status through the admin dashboard (if implemented):

- Pending
- Confirmed
- Completed
- Cancelled

## API Routes

### Public Routes (No Auth Required)

- None

### Authenticated Routes (Login Required)

- `GET /order/checkout/:invId` - Display checkout form for vehicle
- `POST /order/process/:invId` - Process order submission
- `GET /order/confirmation/:orderId` - Display order confirmation
- `GET /order/history` - Display user's order history

## Error Handling

### Form Validation Errors

- All fields are required (phone, address, city, state, zip)
- Form redisplays with error messages if validation fails
- User-entered data is preserved for correction

### Access Control

- Only logged-in users can access order routes
- Users can only view their own orders
- Attempting to view another user's order returns a 403 Forbidden error

## Customization

### Changing Button Style

Edit [utilities/index.js](utilities/index.js) - look for `.order-btn` or `.vehicle-actions` CSS

### Changing Form Fields

Edit the order model and controller to add additional fields (like payment method, delivery notes, etc.)

### Email Notifications

To add email notifications on order placement:

1. Install a mailer package: `npm install nodemailer`
2. Add email sending logic in `orderController.processOrder()`

### Order Status Updates

To implement admin order status updates:

1. Create admin routes to update order status
2. Add admins panel view to list all orders
3. Use `orderModel.updateOrderStatus()` function

## Testing Checklist

- [ ] Migration runs successfully and creates orders table
- [ ] "Order Now" button appears on vehicle detail for logged-in users
- [ ] "Login to Order" button appears for non-logged-in users
- [ ] Clicking order button takes user to checkout form
- [ ] Checkout form displays vehicle info and current account info
- [ ] Form validation prevents empty field submission
- [ ] Order is saved to database on confirmation
- [ ] Order confirmation page displays success message
- [ ] Order confirmation shows all order details correctly
- [ ] Order history page displays all user's orders
- [ ] Clicking "View Details" on order history shows full order information
- [ ] Date/time stamps are correct
- [ ] Phone and address information are saved correctly

## Support & Troubleshooting

### Orders table not created

- Check that the migration file was run successfully
- Verify database connection string in `.env` file
- Check PostgreSQL logs for SQL errors

### Order button not showing

- Verify user is logged in (check browser console for JWT token)
- Clear browser cache and refresh page
- Check that buildSingleVehicleDisplay function is being called with accountData

### Form not submitting

- Check browser console for JavaScript errors
- Verify all required fields are filled
- Check server logs for error messages
- Ensure checkout.ejs view file exists in correct location

### Order not appearing in history

- Verify order was actually saved to database
- Check that account_id matches logged-in user
- Query database directly: `SELECT * FROM public.orders WHERE account_id = <your_id>;`

## Future Enhancements

1. **Payment Integration** - Add Stripe or PayPal integration
2. **Email Notifications** - Send confirmation emails to customers
3. **Order Tracking** - Allow customers to track their order status in real-time
4. **Admin Dashboard** - Allow admins to view and manage all orders
5. **SMS Notifications** - Send status updates via SMS
6. **Order Reviews** - Let customers review vehicles after purchase
7. **Rental Orders** - Support rental/lease orders in addition to purchases
8. **Multiple Vehicles** - Support adding multiple vehicles to order
9. **Saved Addresses** - Let users save multiple delivery addresses
10. **Order Export** - Export order lists to CSV for accounting

---

**Implementation Date:** February 2025
**Framework:** Express.js with EJS Templating
**Database:** PostgreSQL
