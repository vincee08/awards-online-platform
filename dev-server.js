import express from 'express';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import cors from 'cors';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (e) {
    console.error('❌ Firebase Admin Setup Failed:', e.message);
  }
}

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false },
    realtime: { transport: ws }
  }
);

const app = express();
app.use(cors()); // Allow requests from our frontend
app.use(express.json());

// Global Logger
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

// --- API ROUTES ---

app.get('/api/admin/profile', async (req, res) => {
  console.log('📨 Profile Sync Requested');
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('👤 Authenticated:', decodedToken.email);
    
    // Search by auth_user_id (which is now a TEXT column)
    let { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', decodedToken.uid)
      .maybeSingle(); // Use maybeSingle to avoid errors if not found

    if (error) {
      console.error('❌ Supabase Fetch Error:', error);
      throw error;
    }

    if (!data) {
      console.log('🆕 Creating new user record for UID:', decodedToken.uid);
      const { data: newUser, error: createError } = await supabase
        .from('admin_users')
        .insert({
          auth_user_id: decodedToken.uid, // Store the Firebase string here
          email: decodedToken.email,
          full_name: decodedToken.name || 'New Admin',
          avatar_url: decodedToken.picture || null,
          role: 'admin',
          status: 'pending'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ User Creation Failed:', createError);
        throw createError;
      }
      console.log('✅ New User Created');
      data = newUser;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/awards', async (req, res) => {
  console.log('📝 Creating New Award...');
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Verify user is an approved admin in Supabase
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, status, role')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (adminError || adminUser?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized: Admin not approved' });
    }

    // MAP Firebase UID -> Internal UUID
    // We use the adminUser.id (which is a real UUID) instead of decodedToken.uid (which is a string)
    const awardData = {
      ...req.body,
      created_by: adminUser.id, // Use the internal database UUID
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('awards')
      .insert([awardData])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Award Created Successfully');
    res.status(201).json(data);
  } catch (error) {
    console.error('🔥 Save Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/awards/:id', async (req, res) => {
  console.log(`📝 Updating Award: ${req.params.id}`);
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Verify user is an approved admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (adminError || adminUser?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('awards')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Award Updated Successfully');
    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 Update Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/awards/:id/archive', async (req, res) => {
  console.log(`📦 Archiving Award: ${req.params.id}`);
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Verify user is an approved admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (adminError || adminUser?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('awards')
      .update({ visibility_status: 'hidden' })
      .eq('id', req.params.id);

    if (error) throw error;
    
    console.log('✅ Award Archived Successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('🔥 Archive Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  console.log('📊 Fetching Dashboard Stats...');
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if requester is an approved admin
    const { data: requester, error: reqError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (reqError || requester?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const [awards, admins, pending, recent] = await Promise.all([
      supabase.from('awards').select('*', { count: 'exact', head: true }).neq('visibility_status', 'hidden'),
      supabase.from('admin_users').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('admin_users').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('awards').select('*').neq('visibility_status', 'hidden').order('created_at', { ascending: false }).limit(5)
    ]);

    res.status(200).json({
      totalAwards: awards.count || 0,
      approvedAdmins: admins.count || 0,
      pendingRequests: pending.count || 0,
      recentAwards: recent.data || []
    });
  } catch (error) {
    console.error('🔥 Stats Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Admin User Management
app.get('/api/admin/users', async (req, res) => {
  console.log('📨 Fetching All Admin Users...');
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if requester is an approved admin
    const { data: requester, error: reqError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', decodedToken.uid)
      .maybeSingle();

    if (reqError || !requester || requester.status !== 'approved') {
      console.log(`🚫 Access Denied for ${decodedToken.email}: Status is ${requester?.status || 'Not Found'}`);
      return res.status(403).json({ error: 'Unauthorized: Approved admin access required' });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase Fetch All Users Error:', error);
      throw error;
    }
    
    console.log(`✅ Sending ${data?.length || 0} users to frontend`);
    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 Fetch Users Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
  console.log(`👤 Updating Status for User: ${req.params.id}`);
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { status } = req.body;

    const { data: requester } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (requester?.role !== 'super_admin' || requester?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 Update Status Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/role', async (req, res) => {
  console.log(`🔑 Updating Role for User: ${req.params.id}`);
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { role } = req.body;

    const { data: requester } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (requester?.role !== 'super_admin' || requester?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 Update Role Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Award Details
app.get('/api/awards/:id', async (req, res) => {
  console.log(`🔍 Fetching Award Details: ${req.params.id}`);
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('🔥 Fetch Award Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Secure Image Upload
app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  console.log('📤 Processing Image Upload...');
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split('Bearer ')[1];
  
  if (!idToken) return res.status(401).json({ error: 'No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if requester is an approved admin
    const { data: requester, error: reqError } = await supabase
      .from('admin_users')
      .select('status')
      .eq('auth_user_id', decodedToken.uid)
      .single();

    if (reqError || requester?.status !== 'approved') {
      return res.status(403).json({ error: 'Unauthorized: Approved admin access required' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `awards/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('award-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('award-images')
      .getPublicUrl(filePath);

    console.log('✅ Image Uploaded Successfully');
    res.status(200).json({ publicUrl });
  } catch (error) {
    console.error('🔥 Upload Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
