import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

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
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if the requester is a SUPER ADMIN
    const { data: requester } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (!requester || requester.status !== 'approved' || requester.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only approved super admins can manage users' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const { id } = req.query; // Expecting user ID in query
      const { status, role } = req.body;
      
      const updateData: any = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (role) updateData.role = role;

      const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
