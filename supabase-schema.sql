-- Tutor Management Dashboard Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create users table for admin role management (connects to existing booking_owners for tutors)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'tutor', 'user'
    booking_owner_id UUID REFERENCES booking_owners(id), -- Link to existing booking_owners table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutors table (separate from booking_owners - these are contractors)
CREATE TABLE IF NOT EXISTS tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    instruments TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    strikes INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend existing booking_owners table with enquiry management fields
-- Run these ALTER statements to add new columns to your existing table
ALTER TABLE booking_owners ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'; -- 'new', 'assigned', 'expired', 'completed'
ALTER TABLE booking_owners ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES tutors(id);
ALTER TABLE booking_owners ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE booking_owners ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE booking_owners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create messages table for email communication tracking
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_owner_id UUID REFERENCES booking_owners(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'admin', 'tutor', 'student'
    sender_email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_owners_status ON booking_owners(status);
CREATE INDEX IF NOT EXISTS idx_booking_owners_tutor_id ON booking_owners(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutors_active ON tutors(active);
CREATE INDEX IF NOT EXISTS idx_messages_booking_owner_id ON messages(booking_owner_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create user record
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_owners_updated_at BEFORE UPDATE ON booking_owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies (adjust based on your auth setup)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for different user roles
CREATE POLICY "Users can view own record" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Enable all access for service role" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin users: Full access to everything
CREATE POLICY "Enable all access for admin users" ON tutors FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Tutors: Can only view their own record and assigned enquiries
CREATE POLICY "Tutors can view own record" ON tutors FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'tutor'
        AND users.booking_owner_id = tutors.id
    )
);

CREATE POLICY "Enable all access for admin users" ON booking_owners FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Tutors can only see their assigned booking_owners (enquiries)
CREATE POLICY "Tutors can view assigned enquiries" ON booking_owners FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN tutors t ON u.booking_owner_id = t.id
        WHERE u.id = auth.uid() 
        AND u.role = 'tutor'
        AND booking_owners.tutor_id = t.id
    )
);

CREATE POLICY "Enable all access for admin users" ON messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);
