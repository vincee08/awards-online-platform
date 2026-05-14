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
  // 1. Check Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 2. Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // 3. Verify requester is an approved admin in Supabase
    const { data: requester, error: reqError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', firebaseUid)
      .single();

    if (reqError || requester?.status !== 'approved') {
      console.warn(`🚫 Access Denied for ${decodedToken.email}: Status is ${requester?.status || 'Not Found'}`);
      return res.status(403).json({ error: 'Unauthorized: Approved admin access required' });
    }

    // 4. Fetch Stats in Parallel
    console.log('📊 Fetching Dashboard Stats...');
    const [awards, admins, pending, recent] = await Promise.all([
      // Count ONLY published awards for the dashboard total
      supabase.from('awards').select('*', { count: 'exact', head: true }).eq('visibility_status', 'published'),
      
      // Count approved admins
      supabase.from('admin_users').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      
      // Count pending requests
      supabase.from('admin_users').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Get 5 latest awards (ONLY published ones for the dashboard)
      supabase.from('awards')
        .select('*')
        .eq('visibility_status', 'published')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Log the results for debugging
    console.log('✨ Stats Fetched:', {
      totalAwards: awards.count,
      activeAdmins: admins.count,
      pendingAdmins: pending.count,
      recentCount: recent.data?.length
    });

    return res.status(200).json({
      totalAwards: awards.count || 0,
      approvedAdmins: admins.count || 0,
      pendingRequests: pending.count || 0,
      recentAwards: recent.data || []
    });

  } catch (error: any) {
    console.error('🔥 Dashboard Stats API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
