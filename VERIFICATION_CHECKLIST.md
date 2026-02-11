# Implementation Verification Checklist

Use this checklist to verify all components are properly installed and configured.

## ✅ Database Migrations

- [ ] Executed `002_add_profiles.sql` - profiles table created
- [ ] Executed `003_add_activity_log.sql` - activity_log table created
- [ ] Executed `004_add_reviews.sql` - reviews table created
- [ ] Executed `005_add_roles.sql` - roles table created and role_id added to account
- [ ] All tables visible in pgAdmin or psql
- [ ] Default roles (Client, Employee, Admin) inserted

**Verification Query:**

```sql
SELECT * FROM information_schema.tables WHERE table_name IN ('profiles', 'activity_log', 'reviews', 'roles');
```

---

## ✅ Files Exist

### Models

- [ ] `models/profile-model.js` exists
- [ ] `models/activity-model.js` exists
- [ ] `models/review-model.js` exists
- [ ] `models/role-model.js` exists
- [ ] `models/search-model.js` exists

### Controllers

- [ ] `controllers/profileController.js` exists
- [ ] `controllers/activityController.js` exists
- [ ] `controllers/reviewController.js` exists
- [ ] `controllers/adminController.js` exists
- [ ] `controllers/searchController.js` exists

### Routes

- [ ] `routes/profileRoute.js` exists
- [ ] `routes/activityRoute.js` exists
- [ ] `routes/reviewRoute.js` exists
- [ ] `routes/adminRoute.js` exists
- [ ] `routes/searchRoute.js` exists

### Views

- [ ] `views/account/profile.ejs` exists
- [ ] `views/account/edit-profile.ejs` exists
- [ ] `views/account/activity.ejs` exists
- [ ] `views/inventory/review-form.ejs` exists
- [ ] `views/inventory/search.ejs` exists
- [ ] `views/inventory/advanced-search.ejs` exists
- [ ] `views/admin/dashboard.ejs` exists
- [ ] `views/admin/manage-users.ejs` exists
- [ ] `views/admin/activity-log.ejs` exists
- [ ] `views/admin/pending-reviews.ejs` exists

### Configuration

- [ ] `server.js` updated with all route imports and app.use() calls
- [ ] `utilities/index.js` exports `checkLogin` middleware
- [ ] `account-model.js` has `deleteAccount` function

---

## ✅ Server Configuration

In `server.js`, verify these lines exist:

### Requires

```javascript
const profileRoute = require("./routes/profileRoute");
const activityRoute = require("./routes/activityRoute");
const reviewRoute = require("./routes/reviewRoute");
const adminRoute = require("./routes/adminRoute");
const searchRoute = require("./routes/searchRoute");
```

### Route Registration

```javascript
app.use("/profile", profileRoute);
app.use("/activity", activityRoute);
app.use("/reviews", reviewRoute);
app.use("/admin", adminRoute);
app.use("/search", searchRoute);
```

---

## ✅ Utilities Configuration

In `utilities/index.js`, verify:

### Require

```javascript
const { checkLogin } = require("../middleware/auth");
```

### Export

```javascript
module.exports = {
  getImagePath,
  buildVehicleDetailHTML,
  buildClassificationList,
  checkLogin, // ← This should be present
  ...Util,
};
```

---

## ✅ Testing Routes

Navigate to each URL and verify they load without errors:

### Profile Features

- [ ] `/profile` - Shows profile (must be logged in)
- [ ] `/profile/edit` - Shows edit form (must be logged in)
- [ ] Submit profile form without errors

### Activity Log

- [ ] `/activity` - Shows personal activity (must be logged in)
- [ ] `/activity/all` - Shows all activity (must be admin - may redirect)

### Search Features

- [ ] `/search` - Shows search form
- [ ] `/search?searchTerm=toyota` - Shows search results
- [ ] `/search/advanced` - Shows advanced search form

### Admin Features (After setting role_id to 3)

- [ ] `/admin/dash` - Shows admin dashboard
- [ ] `/admin/users` - Shows user management

### Review Features

- [ ] `/reviews/1/form` - Shows review form for first inventory item
- [ ] (Submit form to test)

---

## ✅ Database Data Verification

### Check default roles exist

```sql
SELECT * FROM roles;
-- Should show: Client, Employee, Admin
```

### Check account has role_id column

```sql
SELECT account_id, role_id FROM account LIMIT 1;
-- Should show role_id column exists
```

### Make yourself an admin (for testing)

```sql
UPDATE account SET role_id = 3 WHERE account_id = YOUR_ID;
```

### Create a test profile

```sql
INSERT INTO profiles (account_id) VALUES (YOUR_ID);
```

---

## ✅ Authentication Testing

1. [ ] Log in with valid credentials → redirects to home
2. [ ] Log out → JWT cookie cleared
3. [ ] Try `/profile` without login → redirects to login
4. [ ] Try `/admin/dash` without being admin → shows access denied
5. [ ] Try `/admin/dash` as admin → shows dashboard

---

## ✅ Data Validation Testing

### Profile Form

- [ ] Submit with empty fields → validates
- [ ] Submit with valid data → saves
- [ ] Phone field accepts 20 chars
- [ ] State field accepts 2 chars
- [ ] Zip accepts 10 chars

### Review Form

- [ ] Require star selection
- [ ] Validate rating 1-5
- [ ] Limit review text to 1000 chars
- [ ] Submit and verify pending status

### Search

- [ ] Search with no term → shows error
- [ ] Search with valid term → shows results
- [ ] Advanced search with filters → applies all filters

---

## ✅ Admin Functions Testing

(After setting role_id = 3)

- [ ] View user list at `/admin/users`
- [ ] Change user role → saves in database
- [ ] Delete user account → removes from system
- [ ] View activity log at `/activity/all`
- [ ] Filter activity by date range → works
- [ ] View pending reviews at `/reviews/admin/pending`
- [ ] Approve review → status changes
- [ ] Reject review → review deleted

---

## ✅ Security Verification

### Check SQL Queries Use Prepared Statements

- [ ] Open any model file
- [ ] Verify queries use `$1, $2, $3` parameters
- [ ] No string concatenation in WHERE clauses

### Check Input Validation

- [ ] Form submissions validate on server-side
- [ ] Invalid inputs show error messages
- [ ] Sanitization removes extra whitespace

### Check Authentication

- [ ] JWT tokens required for protected routes
- [ ] Token verified before access
- [ ] Expired sessions redirected to login

### Check Authorization

- [ ] Admin-only routes check role
- [ ] Non-admins cannot access admin features
- [ ] Users can't modify other users' profiles

---

## ✅ Error Handling

- [ ] Try accessing non-existent inventory item → 404
- [ ] Submit invalid form data → shows validation error
- [ ] Database connection failure → error page
- [ ] All errors caught with try-catch blocks
- [ ] Console shows error messages for debugging

---

## ✅ Browser Testing

Test in multiple browsers if possible:

### Chrome/Chromium

- [ ] All routes load
- [ ] Forms submit correctly
- [ ] Styling displays properly
- [ ] API calls work

### Firefox

- [ ] Same as Chrome

### Safari (if available)

- [ ] Same as Chrome

---

## ✅ Performance Check

- [ ] Page load times reasonable (< 2 seconds)
- [ ] Images displayed quickly
- [ ] No console JavaScript errors
- [ ] No missing assets (404 errors)

---

## ⚠️ Common Issues & Solutions

### Issue: "Route not found"

**Solution:** Verify `server.js` has the route requires and `app.use()` calls

### Issue: "Cannot find module"

**Solution:** Ensure file is in correct directory with exact name

### Issue: "Table does not exist"

**Solution:** Run migrations again: `psql -U postgres -d cse340 -f database/migrations/002_add_profiles.sql`

### Issue: "Redirects to login"

**Solution:** You're not logged in. Log in first, or check JWT cookie exists

### Issue: "Access Denied" on admin routes

**Solution:** Your account needs role_id = 3 (Admin). Update in database or create admin account

### Issue: 500 server error

**Solution:** Check server console for error details. Most likely a database or permission issue

---

## 📊 Status Summary

| Component     | Status     | Notes                          |
| ------------- | ---------- | ------------------------------ |
| Migrations    | ⏳ Pending | Run SQL files                  |
| Models        | ✅ Ready   | All 5 model files created      |
| Controllers   | ✅ Ready   | All 5 controller files created |
| Routes        | ✅ Ready   | All 5 route files created      |
| Views         | ✅ Ready   | All 10 view files created      |
| Server Config | ✅ Ready   | server.js updated              |
| Utilities     | ✅ Ready   | checkLogin exported            |
| Testing       | ⏳ Pending | Run through checklist          |

---

**Last Updated:** February 11, 2026
**Implementation Status:** 90% Complete (awaiting migrations)
**Estimated Setup Time:** 15-30 minutes

---

## Next Steps

1. ✅ Verify all files exist
2. ✅ Run database migrations
3. ✅ Restart server (`npm run dev`)
4. ✅ Go through Testing routes section
5. ✅ Set role_id to test admin features
6. ✅ Review MVC_IMPLEMENTATION_GUIDE.md for detailed usage

**You're all set! Enjoy your new features.** 🎉
