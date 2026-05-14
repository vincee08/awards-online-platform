import React from 'react';
import { motion } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import { signOut } from '../lib/auth';

const WaitingApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-admin flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl shadow-admin/10 border border-gray-100 text-center"
      >
        <div className="inline-flex p-4 bg-orange-100 rounded-2xl text-orange-600 mb-6">
          <Clock size={40} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Pending Approval</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your account has been registered. Please wait for a <span className="font-bold text-admin">Super Admin</span> to approve your access request.
        </p>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-8">
          <p className="text-sm text-orange-700 font-medium">
            You will be able to access the dashboard once your status is changed to "Approved".
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 w-full py-3 text-gray-500 hover:text-gray-800 transition-colors font-semibold"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </motion.div>
    </div>
  );
};

export default WaitingApprovalPage;
