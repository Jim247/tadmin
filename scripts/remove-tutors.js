import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const emails = [
  'alice.smith@example.com',
  'bob.jones@example.com',
  'charlie.brown@example.com',
  'daisy.evans@example.com',
  'ethan.lee@example.com',
];

async function removeTutors() {
  const { error } = await supabase
    .from('tutors')
    .delete()
    .in('email', emails);
  if (error) {
    console.error('Error deleting tutors:', error.message);
  } else {
    console.log('Dummy tutors removed.');
  }
}

removeTutors();
