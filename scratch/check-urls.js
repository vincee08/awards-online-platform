import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkAwards() {
  const { data, error } = await supabase.from('awards').select('award_name, image_url').limit(5);
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('--- Current Awards in DB ---');
  data.forEach(a => {
    console.log(`Award: ${a.award_name}`);
    console.log(`URL:   ${a.image_url}`);
    console.log('---------------------------');
  });
}

checkAwards();
