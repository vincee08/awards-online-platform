import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // 2. Query Supabase (using Service Role to bypass RLS)
    const { data: profile, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // 3. If no profile exists, create a pending one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('admin_users')
        .insert({
          auth_user_id: firebaseUid,
          email: decodedToken.email!,
          full_name: decodedToken.name || decodedToken.email,
          avatar_url: decodedToken.picture,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;
      return res.status(200).json(newProfile);
    }

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
