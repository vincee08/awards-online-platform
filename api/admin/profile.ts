import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin credentials in environment variables');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin Initialized');
    } catch (err) {
      console.error('❌ Firebase Admin Initialization Error:', err);
    }
  }
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify Firebase Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authErr: any) {
      console.error('🔐 Token Verification Failed:', authErr.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const firebaseUid = decodedToken.uid;

    // 2. Query Supabase (using Service Role to bypass RLS)
    const { data: profile, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('🗄️ Database Query Error:', error.message);
      return res.status(500).json({ error: 'Database error occurred' });
    }

    // 3. If no profile exists, return 404 as requested
    if (!profile) {
      console.warn(`⚠️ Profile not found for UID: ${firebaseUid}`);
      return res.status(404).json({ error: 'Admin profile not found. Please contact a super admin.' });
    }

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('🔥 Unexpected API Error:', error);
    return res.status(500).json({ error: 'An internal server error occurred' });
  }
}

