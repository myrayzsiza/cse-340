# Quick Start Guide - CSE-340 MVC Enhancements

## ✅ Implementation Complete

All features have been successfully implemented. Here's what was added to your project:

## 📁 Files Created

### Database Migrations (4 files)

```
database/migrations/
├── 002_add_profiles.sql          - User profiles table
├── 003_add_activity_log.sql      - Activity tracking
├── 004_add_reviews.sql           - Review system
└── 005_add_roles.sql             - Role-based access control
```

### Models (5 files)

```
models/
├── profile-model.js              - Profile CRUD operations
├── activity-model.js             - Activity logging functions
├── review-model.js               - Review management
├── role-model.js                 - Role/admin functions
└── search-model.js               - Search/filter functions
```

### Controllers (5 files)

```
controllers/
├── profileController.js           - Profile view/edit/delete
├── activityController.js          - Activity tracking
├── reviewController.js            - Review submission/approval
├── adminController.js             - Admin dashboard
└── searchController.js            - Search/filter results
```

### Routes (5 files)

```
routes/
├── profileRoute.js               - /profile/* endpoints
├── activityRoute.js              - /activity/* endpoints
├── reviewRoute.js                - /reviews/* endpoints
├── adminRoute.js                 - /admin/* endpoints
└── searchRoute.js                - /search/* endpoints
```

### Views (10 files)

```
views/
├── account/
│   ├── profile.ejs               - View profile
│   ├── edit-profile.ejs          - Edit profile form
│   └── activity.ejs              - Personal activity
├── inventory/
│   ├── review-form.ejs           - Write review
│   ├── search.ejs                - Simple search
│   └── advanced-search.ejs       - Advanced search
└── admin/
    ├── dashboard.ejs             - Admin overview
    ├── manage-users.ejs          - User management
    ├── activity-log.ejs          - Full activity log
    └── pending-reviews.ejs       - Review moderation
```

## 🚀 Getting Started

### Step 1: Run Database Migrations

Execute these in order to create all required tables and roles:

```bash
# On Windows PowerShell or Command Prompt:
psql -U postgres -d cse340 -f database/migrations/002_add_profiles.sql
psql -U postgres -d cse340 -f database/migrations/003_add_activity_log.sql
psql -U postgres -d cse340 -f database/migrations/004_add_reviews.sql
psql -U postgres -d cse340 -f database/migrations/005_add_roles.sql
```

**Note:** Replace `postgres` with your database user and `cse340` with your database name.

### Step 2: Restart Your Server

```bash
npm run dev
```

The application will load with all new features ready.

### Step 3: Test Features

#### Test User Profile

1. Log in with an existing account
2. Go to `/profile` to view your profile
3. Click "Edit Profile" to add information
4. Save and verify changes

#### Test Search Feature

1. Navigate to `/search` for simple search
2. Or `/search/advanced` for filtered search
3. Try searching for vehicle makes/models
4. View detailed results

#### Become an Admin (Database)

To access admin features, you need to update your account role in the database:

```sql
-- Connect to your database and run:
UPDATE account SET role_id = 3 WHERE account_id = YOUR_ACCOUNT_ID;
```

Then:

1. Log out and log back in
2. Visit `/admin/dash` for the admin dashboard
3. Explore `/admin/users`, `/activity/all`, `/reviews/admin/pending`

#### Test Reviews

1. View a vehicle detail page
2. Click "Write a Review" (at bottom of detail page)
3. Select a rating and write a comment
4. Submit for approval
5. Admin approves at `/reviews/admin/pending`

#### Test Activity Log

1. Log in and perform some actions
2. Check your personal activity at `/activity`
3. Admins can view all activity at `/activity/all`

## 🔑 Key Features

### 1. User Profiles

- Extended user information (phone, address, bio)
- Personal and editable
- Associated with account via foreign key

### 2. Activity Log

- Automatic tracking of logins, updates
- Date/time and IP address recorded
- Admin can view all users' activities

### 3. Reviews

- 1-5 star ratings with comments
- Pending approval workflow
- Average ratings calculated automatically
- One review per user per vehicle

### 4. Admin Dashboard

- User statistics and management
- Role assignment (Admin/Employee/Client)
- Delete user accounts
- View all activities
- Moderate reviews

### 5. Search & Filter

- Search by make, model, description
- Advanced filters (year, price range)
- Auto-complete makes list
- Returns vehicle details and images

## 🔒 Security Features

✅ **Prepared Statements** - All SQL queries use parameterized statements ($1, $2, etc.)
✅ **Input Validation** - Express-validator on all inputs
✅ **Input Sanitization** - Trim and validate all user data
✅ **Password Hashing** - Bcryptjs for passwords (existing)
✅ **Authentication** - JWT tokens for session management
✅ **Authorization** - Role-based access control for admin features

## 📋 Route Reference

### Profile Routes

```
GET    /profile              - View profile
GET    /profile/edit         - Edit form
POST   /profile/update       - Save changes
POST   /profile/delete       - Delete profile
```

### Activity Routes

```
GET    /activity             - Personal activity
GET    /activity/all         - All activities (admin)
POST   /activity/date-range  - Filter by date (admin)
```

### Review Routes

```
GET    /reviews/:invId/form  - Review form
POST   /reviews/:invId       - Submit review
GET    /reviews/:invId       - Get reviews (API)
DELETE /reviews/:reviewId    - Delete review
GET    /reviews/admin/pending    - Pending reviews (admin)
POST   /reviews/:reviewId/approve - Approve (admin)
```

### Admin Routes

```
GET    /admin/dash           - Dashboard
GET    /admin/users          - Manage users
POST   /admin/users/role     - Update role
DELETE /admin/users/:userId  - Delete user
GET    /admin/api/stats      - Stats (API)
```

### Search Routes

```
GET    /search               - Search page
GET    /search/results       - Show results
GET    /search/api/search    - Search API
GET    /search/advanced      - Advanced form
POST   /search/advanced/results - Advanced results
```

## 🔧 Customization

### Change Admin Role ID

Currently set to 3. To change, edit `role-model.js` and database queries.

### Change Review Approval Flow

Edit `reviewController.js` to auto-approve or send emails to admins.

### Add More Profile Fields

1. Add column to `profiles` table
2. Add form field in `edit-profile.ejs`
3. Update controller validation

### Customize Search

Edit `search-model.js` to add more fields or filters.

## ❓ Troubleshooting

**Q: Routes not found (404)**
A: Ensure server.js has all route requires and app.use() calls. Restart server.

**Q: Profile page blank**
A: User must be logged in. Check JWT cookie is set. Verify profile created in DB.

**Q: Admin features not accessible**
A: Update account role_id to 3 in database. Log out and back in.

**Q: Database errors on start**
A: Ensure all migrations ran successfully. Check PostgreSQL is running and accessible.

**Q: Validation errors**
A: Check browser console for details. Verify input requirements in controller.

## 📚 Documentation

See `MVC_IMPLEMENTATION_GUIDE.md` for:

- Detailed feature explanations
- Database schema details
- API endpoint documentation
- Next steps for enhancements
- Troubleshooting guide

## ✨ Next Improvements

Consider adding:

1. Email notifications for review approvals
2. Image uploads for profile pictures
3. Pagination for activity logs
4. Real-time notifications
5. Export reports to CSV
6. User search in admin panel
7. More granular role permissions
8. Activity filtering by action type

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Review MVC_IMPLEMENTATION_GUIDE.md
3. Check server console for error messages
4. Verify database migrations completed
5. Ensure all files are in correct locations

---

**Implementation Date:** February 11, 2026
**Total Files Added:** 29 files (4 migrations, 5 models, 5 controllers, 5 routes, 10 views)
**Features:** 5 major features fully implemented
