-- Tutor Management Dashboard Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create tutors table
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

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    instrument VARCHAR(255),
    level VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50),
    instrument VARCHAR(255) NOT NULL,
    level VARCHAR(100),
    location VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'assigned', 'expired', 'completed'
    tutor_id UUID REFERENCES tutors(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for email communication tracking
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'admin', 'tutor', 'student'
    sender_email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_tutor_id ON enquiries(tutor_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_tutors_active ON tutors(active);
CREATE INDEX IF NOT EXISTS idx_messages_enquiry_id ON messages(enquiry_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies (adjust based on your auth setup)
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
CREATE POLICY "Enable read access for authenticated users" ON tutors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for service role" ON tutors FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Enable read access for authenticated users" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for service role" ON students FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Enable read access for authenticated users" ON enquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for service role" ON enquiries FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Enable read access for authenticated users" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for service role" ON messages FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
