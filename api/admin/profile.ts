import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials (Project ID, Client Email, or Private Key)');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }

    // 2. Initialize Supabase if not already initialized
    if (!supabaseClient) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase URL or Service Role Key');
      }
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }

    // 3. Verify Auth Token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authErr: any) {
      return res.status(401).json({ error: `Invalid token: ${authErr.message}` });
    }

    const firebaseUid = decodedToken.uid;

    // 4. Query Supabase
    const { data: profile, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database Query Error: ${error.message}`);
    }

    if (!profile) {
      return res.status(404).json({ error: 'Admin profile not found. Please contact a super admin.' });
    }

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('🔥 Vercel Backend Error:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred' });
  }
}

