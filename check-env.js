import fs from 'fs';
import path from 'path';

const requiredKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const adminKeys = [
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

async function checkEnv() {
  console.log('🔍 Checking environment variables...\n');
  
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env file not found!');
    console.log('Please create a .env file in the root directory.');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const envVars = {};

  lines.forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envVars[key] = value.trim();
    }
  });

  let missingCount = 0;

  console.log('--- Frontend Variables (VITE_*) ---');
  requiredKeys.forEach(key => {
    if (!envVars[key] || envVars[key].includes('your-') || envVars[key].includes('https://your-')) {
      console.log(`❌ ${key}: Missing or Placeholder`);
      missingCount++;
    } else {
      console.log(`✅ ${key}: OK`);
    }
  });

  console.log('\n--- Admin/Server Variables ---');
  adminKeys.forEach(key => {
    if (!envVars[key] || envVars[key].includes('your-')) {
      console.log(`❌ ${key}: Missing or Placeholder`);
      missingCount++;
    } else {
      console.log(`✅ ${key}: OK`);
      if (key === 'FIREBASE_PRIVATE_KEY' && !envVars[key].includes('\\n')) {
        console.warn('⚠️  WARNING: FIREBASE_PRIVATE_KEY might be missing newline characters (\\n).');
      }
    }
  });

  console.log('\n--- Summary ---');
  if (missingCount === 0) {
    console.log('🚀 ALL CLEAR! Your environment is ready.');
  } else {
    console.log(`⚠️  Found ${missingCount} issues. Please update your .env file.`);
  }
}

checkEnv();
