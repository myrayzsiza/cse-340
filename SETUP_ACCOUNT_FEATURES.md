# Quick Setup Guide - Account Features

## What's New

✨ **Account Update**: Users can now change their password and update account details (name, email)  
✨ **Forgot Password**: Complete password reset flow with secure reset tokens

## Database Setup (REQUIRED)

Before testing, run this SQL on your database:

```sql
-- Add password reset fields to account table
ALTER TABLE public.account
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_account_reset_token ON public.account(reset_token);
```

**Using pgAdmin or DBeaver:**

1. Open your database connection
2. Find your database in the tree
3. Right-click and select "Query Tool"
4. Paste the SQL above
5. Click "Execute"

**Using command line (psql):**

```bash
psql -U postgres -d database_name -f database/migrations/001_add_password_reset.sql
```

## Testing the Features

### Test Account Update (After Login)

1. Log in with your account
2. Click **"Update Account Information"** button
3. Change your first name, last name, or email address
4. Click **"Update Information"**
5. Return to management page and verify changes

### Test Password Change (After Login)

1. On the **"Update Account Information"** page
2. Scroll to the **"Change Password"** section
3. Enter a new password meeting the requirements
4. Click **"Change Password"**
5. Return to management and try logging in with your new password

### Test Forgot Password (New)

1. Go to **login page**
2. Click **"Forgot your password?"** link
3. Enter your email address
4. Check the **server console** (your terminal running Node.js)
5. Copy the reset link from the console log
6. Paste it into your browser address bar
7. Enter your new password (must be 12+ chars with uppercase, lowercase, digit, and special character)
8. Click **"Reset Password"**
9. Log in with your new password

## Password Requirements

All passwords must contain:

- ✓ At least 12 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one digit (0-9)
- ✓ At least one special character (!@#$%^&\*)

**Example:** `MyPassword123!`

## Important Notes

- **Reset tokens expire after 1 hour** for security
- **Reset tokens appear in console** - In production, configure email to send them instead
- **All passwords force new requirements** - Can't use weak passwords
- **Change password from Update page** - Don't need old password verification
- **Forgot password is public** - Anyone can reset if they have your email (secure design)

## Files Changed

📝 See `ACCOUNT_FEATURES_GUIDE.md` for complete technical documentation

## Troubleshooting

**"reset_token already exists" error?**  
→ You've already applied the migration. That's fine!

**Links not working?**  
→ Make sure you've applied the database migration first

**Can't see reset link in console?**  
→ Make sure your Node.js server is running with console output visible

**Password reset not working?**  
→ Check that your new password meets all 5 requirements

## Next: Enable Email Sending (Optional)

To automatically email reset links instead of showing them in console:

1. Install: `npm install nodemailer`
2. See instructions in `ACCOUNT_FEATURES_GUIDE.md` under "Email Configuration"
3. Add email service credentials to `.env`

---

**All features are ready to use!** 🎉
