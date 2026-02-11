# CSE-340 MVC Enhancement Implementation Guide

This document outlines all the new features added to your CSE-340 project.

## Features Implemented

### 1. User Profiles

**What it does:** Allows users to create and manage extended profile information beyond their basic account details.

**Database:**

- Table: `profiles` (linked to `account` table)
- Fields: bio, phone_number, address, city, state, zip_code, profile_picture

**Routes:**

- `GET /profile` - View user profile
- `GET /profile/edit` - Edit profile form
- `POST /profile/update` - Update profile
- `POST /profile/delete` - Delete profile

**Files:**

- Model: `models/profile-model.js`
- Controller: `controllers/profileController.js`
- Routes: `routes/profileRoute.js`
- Views: `views/account/profile.ejs`, `views/account/edit-profile.ejs`

---

### 2. Activity Log

**What it does:** Tracks user actions (login, updates, etc.) for audit purposes.

**Database:**

- Table: `activity_log` (linked to `account` table)
- Fields: action_type, description, ip_address, user_agent, created_at

**Routes:**

- `GET /activity` - View personal activity
- `GET /activity/all` - View all activity (admin only)
- `POST /activity/date-range` - Filter by date range (admin only)

**Files:**

- Model: `models/activity-model.js`
- Controller: `controllers/activityController.js`
- Routes: `routes/activityRoute.js`
- Views: `views/account/activity.ejs`, `views/admin/activity-log.ejs`

---

### 3. Reviews System

**What it does:** Allows users to leave reviews and ratings on inventory items with admin approval workflow.

**Database:**

- Table: `reviews` (linked to `inventory` and `account` tables)
- Fields: rating (1-5), review_text, is_approved, created_at

**Routes:**

- `GET /reviews/:invId/form` - Review form for inventory item
- `POST /reviews/:invId` - Submit review
- `GET /reviews/:invId` - Get reviews (API)
- `DELETE /reviews/:reviewId` - Delete review
- `GET /reviews/admin/pending` - View pending reviews (admin)
- `POST /reviews/:reviewId/approve` - Approve review (admin)

**Files:**

- Model: `models/review-model.js`
- Controller: `controllers/reviewController.js`
- Routes: `routes/reviewRoute.js`
- Views: `views/inventory/review-form.ejs`, `views/admin/pending-reviews.ejs`

---

### 4. Roles & Admin Dashboard

**What it does:** Implements role-based access control and admin management features.

**Database:**

- Table: `roles` (Client, Employee, Admin)
- Modified: `account` table (added `role_id` column)

**Routes:**

- `GET /admin/dash` - Admin dashboard
- `GET /admin/users` - Manage users
- `POST /admin/users/role` - Update user role
- `DELETE /admin/users/:userId` - Delete user account
- `GET /admin/api/stats` - Get statistics (API)

**Files:**

- Model: `models/role-model.js`
- Controller: `controllers/adminController.js`
- Routes: `routes/adminRoute.js`
- Views: `views/admin/dashboard.ejs`, `views/admin/manage-users.ejs`

---

### 5. Search/Filter Feature

**What it does:** Allows users to search and filter inventory by make, model, year, and price.

**Database:** Uses existing `inventory` table

**Routes:**

- `GET /search` - Search page
- `GET /search/results` - Process search
- `GET /search/api/search` - API search endpoint
- `GET /search/advanced` - Advanced search form
- `POST /search/advanced/results` - Process advanced search

**Files:**

- Model: `models/search-model.js`
- Controller: `controllers/searchController.js`
- Routes: `routes/searchRoute.js`
- Views: `views/inventory/search.ejs`, `views/inventory/advanced-search.ejs`

---

## Setup Instructions

### 1. Run Database Migrations

Execute all migration files in order to create the new tables:

```bash
# Connect to your PostgreSQL database and run:
psql -U your_user -d your_database -f database/migrations/002_add_profiles.sql
psql -U your_user -d your_database -f database/migrations/003_add_activity_log.sql
psql -U your_user -d your_database -f database/migrations/004_add_reviews.sql
psql -U your_user -d your_database -f database/migrations/005_add_roles.sql
```

### 2. Verify Routes Registration

Check that `server.js` includes all new route requires and uses them:

```javascript
const profileRoute = require("./routes/profileRoute");
const activityRoute = require("./routes/activityRoute");
const reviewRoute = require("./routes/reviewRoute");
const adminRoute = require("./routes/adminRoute");
const searchRoute = require("./routes/searchRoute");

// And in the routes section:
app.use("/profile", profileRoute);
app.use("/activity", activityRoute);
app.use("/reviews", reviewRoute);
app.use("/admin", adminRoute);
app.use("/search", searchRoute);
```

### 3. Security Features Implemented

- **Prepared Statements:** All queries use parameterized queries with `$1, $2, etc.`
- **Input Validation:** Using `express-validator` for request validation
- **Sanitization:** User inputs are trimmed and validated
- **Authorization:** Role-based access control for admin features
- **Password Protection:** Existing bcryptjs for password hashing

---

## Usage Examples

### Accessing User Profile

1. User logs in
2. Navigate to `/profile` to view profile
3. Click "Edit Profile" to update information
4. Changes are saved to the `profiles` table

### Activity Logging

Activity is tracked automatically for:

- User login attempts
- Account updates
- Profile changes
- Admin actions

Admin users can view all activity:

- `/activity/all` - See all user activities
- Filter by date range using the form

### Leaving Reviews

1. View an inventory item detail page
2. Click "Write a Review"
3. Select 1-5 star rating
4. Add review text (max 1000 characters)
5. Submit for admin approval

Admins can:

- View pending reviews at `/reviews/admin/pending`
- Approve reviews to make them visible
- Reject/delete inappropriate reviews

### Admin Dashboard

Admin users see:

- `/admin/dash` - Overview with user statistics
- `/admin/users` - Manage user roles and delete accounts
- `/activity/all` - View system activity
- `/reviews/admin/pending` - Moderate reviews

### Searching Inventory

Users can:

- Use `/search` for simple text search
- Use `/search/advanced` for filtered search by:
  - Make (brand)
  - Model
  - Year range
  - Price range
- Results are displayed with vehicle images and details

---

## API Endpoints

### Search API

```javascript
GET /search/api/search?searchTerm=mustang
Response: {
  success: true,
  count: 5,
  results: [{ inv_id, inv_year, inv_make, inv_model, inv_price, ... }]
}
```

### Reviews API

```javascript
GET /reviews/:inventoryId
Response: {
  success: true,
  reviews: [...],
  averageRating: 4.2,
  totalReviews: 10
}
```

### Admin Stats API

```javascript
GET /admin/api/stats
Response: {
  success: true,
  stats: {
    totalUsers: 15,
    byRole: [{ role_name: "Admin", count: 1 }, ...]
  }
}
```

---

## Error Handling

- All controllers include try-catch blocks
- User-friendly error messages in views
- Flash messaging for feedback
- Proper HTTP status codes (401, 403, 404, 500)
- Activity logging includes error tracking

---

## Next Steps / Enhancements

1. **Email Notifications:** Send email when reviews are approved
2. **Image Upload:** Allow profile pictures and vehicle images
3. **Pagination:** Add pagination to activity logs and reviews
4. **Notifications:** Real-time notifications for admin actions
5. **Export:** Export activity logs and statistics to CSV
6. **Analytics:** Dashboard with charts and trends
7. **Role Permissions:** More granular permission system
8. **Soft Deletes:** Archive instead of permanent deletion

---

## Troubleshooting

**Issue: Routes not working**

- Verify server.js has all require statements and app.use() calls
- Check that migration files have been executed
- Restart the server

**Issue: Profile not showing**

- Ensure user is logged in (has JWT token)
- Check that accounts have profiles in database (should auto-create)
- Verify account_id is correctly passed

**Issue: Database errors**

- Run migrations in order
- Verify PostgreSQL connection type is correct
- Check constraints are being followed

**Issue: Admin features not accessible**

- Verify user role_id is set to 3 (Admin) in database
- Check isAdmin() function in role-model.js
- Ensure JWT token includes correct user data

---

## Files Summary

**Models (5 new):**

- `profile-model.js` - CRUD for user profiles
- `activity-model.js` - Activity logging
- `review-model.js` - Review management
- `role-model.js` - Role-based access control
- `search-model.js` - Inventory search/filtering

**Controllers (5 new):**

- `profileController.js`
- `activityController.js`
- `reviewController.js`
- `adminController.js`
- `searchController.js`

**Routes (5 new):**

- `profileRoute.js`
- `activityRoute.js`
- `reviewRoute.js`
- `adminRoute.js`
- `searchRoute.js`

**Views (10 new):**

- `views/account/profile.ejs`
- `views/account/edit-profile.ejs`
- `views/account/activity.ejs`
- `views/inventory/review-form.ejs`
- `views/inventory/search.ejs`
- `views/inventory/advanced-search.ejs`
- `views/admin/dashboard.ejs`
- `views/admin/manage-users.ejs`
- `views/admin/activity-log.ejs`
- `views/admin/pending-reviews.ejs`

**Migrations (4 new):**

- `002_add_profiles.sql`
- `003_add_activity_log.sql`
- `004_add_reviews.sql`
- `005_add_roles.sql`

---

## Support

For issues or questions, review the implementation and ensure all steps above are completed.
