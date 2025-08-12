import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tutors = [
  {
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    phone_number: '07123456789',
    instruments: ['Piano', 'Violin'],
    location: { latitude: 51.4545, longitude: -2.5879 }, // Bristol
    postcode: 'BS1 4ST',
  },
  {
    name: 'Bob Jones',
    email: 'bob.jones@example.com',
    phone_number: '07234567890',
    instruments: ['Guitar'],
    location: { latitude: 51.4545, longitude: -2.5879 },
    postcode: 'BS2 0SP',
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    phone_number: '07345678901',
    instruments: ['Drums', 'Bass'],
    location: { latitude: 51.4545, longitude: -2.5879 },
    postcode: 'BS3 1QG',
  },
  {
    name: 'Daisy Evans',
    email: 'daisy.evans@example.com',
    phone_number: '07456789012',
    instruments: ['Flute'],
    location: { latitude: 51.4545, longitude: -2.5879 },
    postcode: 'BS4 2QG',
  },
  {
    name: 'Ethan Lee',
    email: 'ethan.lee@example.com',
    phone_number: '07567890123',
    instruments: ['Saxophone'],
    location: { latitude: 51.4545, longitude: -2.5879 },
    postcode: 'BS5 6XX',
  },
];

async function seedTutors() {
  for (const tutor of tutors) {
    const { error } = await supabase.from('tutors').insert([
      {
        name: tutor.name,
        email: tutor.email,
        phone_number: tutor.phone_number,
        instruments: tutor.instruments,
        location: tutor.location,
        postcode: tutor.postcode,
      },
    ]);
    if (error) {
      console.error(`Error inserting ${tutor.name}:`, error.message);
    } else {
      console.log(`Inserted ${tutor.name}`);
    }
  }
}

seedTutors();
