# Authentication Setup Guide

## 1. Configure Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Configure the following:

### Site URL
```
http://localhost:3000
```
For production, add your actual domain:
```
https://admin.yourdomain.com
```

### Redirect URLs
Add these URLs:
```
http://localhost:3000/dashboard
https://admin.yourdomain.com/dashboard
```

## 2. Create Admin User

In your Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter your admin email and password
4. Click **Create User**
5. **Set admin role**: Go to **SQL Editor** and run:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## 2b. Create Tutor Users (when ready)

When you want to give a tutor limited access:
1. Create auth user in Supabase
2. Link them to their tutor record:
```sql
UPDATE users 
SET role = 'tutor', booking_owner_id = (SELECT id FROM tutors WHERE email = 'tutor@example.com')
WHERE email = 'tutor@example.com';
```

**Access Levels:**
- **Admin** (`role = 'admin'`): Full dashboard access to everything
- **Tutor** (`role = 'tutor'`): Can only see their assigned enquiries  
- **User** (`role = 'user'`): No dashboard access (booking owners use main site)

## 3. Optional: Restrict Signups

For security, disable public signups:
1. Go to **Authentication** → **Settings**
2. Turn OFF "Enable email signups"
3. Now only you can create users via the dashboard

## 4. Test the Setup

1. Visit `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter your admin credentials
4. You'll be redirected to `/dashboard` with full access

## 5. Row Level Security (Optional but Recommended)

Update your RLS policies to only allow authenticated users:

```sql
-- Updated policies using users table
-- These are already included in supabase-schema.sql
-- Run only if you need to update existing policies

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tutors;
CREATE POLICY "Enable all access for admin users only" ON tutors FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.admin = true
    )
);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON students;
CREATE POLICY "Enable all access for admin users only" ON students FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.admin = true
    )
);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON enquiries;
CREATE POLICY "Enable all access for admin users only" ON enquiries FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.admin = true
    )
);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON messages;
CREATE POLICY "Enable all access for admin users only" ON messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.admin = true
    )
);
```

## 6. Production Deployment

When deploying to Vercel:
1. Add your production domain to Supabase Site URL
2. Add redirect URLs for your production domain
3. Update environment variables in Vercel dashboard

Your admin portal is now secured! 🔒
