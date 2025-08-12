# Tutor Management Dashboard

A comprehensive admin portal for managing tutors, students, and enquiries with integrated email communication control.

## Features

- **Enquiry Management**: View, assign, and track student enquiries
- **Tutor Management**: Manage tutor profiles, track strikes, and monitor performance
- **Student Management**: Maintain student records and communication history
- **Email Integration**: Controlled email communication between tutors and students
- **Assignment System**: Assign tutors to enquiries with 24-hour expiry
- **Strike System**: Track tutor performance and reliability

## Tech Stack

- **Frontend**: Next.js 15 + React 19
- **UI Framework**: Ant Design with Refine
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd tempo-admin
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-schema.sql` to create tables
4. Run the SQL from `supabase/functions.sql` to create functions

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.
