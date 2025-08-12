import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE ROLE' : 'ANON'} key`);

async function printTableSchema(table) {
  console.log(`Connecting to: ${supabaseUrl}`);
  console.log(`Using key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
  
  // First try to get count
  const { count, error: countError } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error getting count:', countError);
  } else {
    console.log(`Total rows in '${table}': ${count}`);
  }

  // Try to get data
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching table:', error);
    console.log('This might be due to Row Level Security (RLS) policies.');
    return;
  }

  if (!data || data.length === 0) {
    console.log(`No rows found in table '${table}' that you have permission to see.`);
    console.log('Check RLS policies in your Supabase dashboard.');
    return;
  }

  const row = data[0];
  console.log(`Fields for table '${table}':`);
  Object.keys(row).forEach((key) => {
    console.log('-', key, ':', typeof row[key]);
  });
  
  console.log('\nSample row data:');
  console.log(JSON.stringify(row, null, 2));
}

const table = process.argv[2];
if (!table) {
  console.error('Usage: node scripts/print-table-schema.js <table_name>');
  process.exit(1);
}

printTableSchema(table);
