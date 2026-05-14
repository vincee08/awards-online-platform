import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, signOut } from '../lib/auth';
import { adminApi } from '../lib/api';
import { AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log('🚀 Login Button Clicked');
    setLoading(true);
    setError(null);
    try {
      console.log('🔑 Opening Firebase Google Popup...');
      await signInWithGoogle();
      console.log('✅ Firebase Login Success');

      console.log('📡 Fetching Admin Profile from Backend...');
      const { data: profile } = await adminApi.getProfile();
      console.log('✨ Profile Received:', profile);

      if (profile.role === 'super_admin' || (profile.role === 'admin' && profile.status === 'approved')) {
        console.log('🎟️ Admin Access Granted, redirecting...');
        navigate('/admin');
      } else {
        console.log('⏳ Account Pending Approval');
        setShowPendingModal(true);
      }
    } catch (err: any) {
      console.error('🔥 Login Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-admin flex items-center justify-center p-6">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back to Platform</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl shadow-admin/10 border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-admin/10 rounded-2xl text-admin mb-6">
            <Award size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-500">
            Sign in to manage awards, users, and system settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-admin/20 hover:bg-admin/5 transition-all group disabled:opacity-50"
        >
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
            alt="Google" 
            className="w-6 h-6"
          />
          <span className="text-gray-700 font-bold text-lg">
            {loading ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-400 font-medium">
            Strictly for authorized school administrators only.
          </p>
        </div>
      </motion.div>

      {/* Pending Approval Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 animate-pulse">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Account Pending Approval</h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  Your admin account has been created, but it is still pending approval. Please wait until a super admin approves your access.
                </p>

                <button
                  onClick={async () => {
                    await signOut();
                    setShowPendingModal(false);
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
