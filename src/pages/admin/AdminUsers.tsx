import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Clock,
  ShieldCheck,
  UserX,
  Users
} from 'lucide-react';
import type { Database } from '../../types/supabase';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { TableSkeleton } from '../../components/Skeleton';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

const AdminUsers: React.FC = () => {
  const { profile } = useOutletContext<{ profile: AdminUser }>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUsers();
      console.log('📥 Received users from API:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId: string, status: AdminUser['status']) => {
    if (profile?.role !== 'super_admin') {
      alert('Only super admins can manage user status');
      return;
    }

    try {
      const { data } = await adminApi.updateUserStatus(userId, status);
      setUsers(users.map(u => u.id === userId ? { ...u, status: data.status } : u));
    } catch (error: any) {
      alert(error.response?.data?.error || error.message);
    }
  };

  const updateRole = async (userId: string, role: AdminUser['role']) => {
    if (profile?.role !== 'super_admin') {
      alert('Only super admins can manage user roles');
      return;
    }

    try {
      const { data } = await adminApi.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role: data.role } : u));
    } catch (error: any) {
      alert(error.response?.data?.error || error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-500">Approve new requests and manage system permissions.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Requested On</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-4">
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, idx) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar_url || ''} className="w-10 h-10 rounded-full bg-gray-100 object-cover border border-slate-100" alt="" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{user.full_name}</p>
                            {user.auth_user_id === profile?.auth_user_id && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-md tracking-tighter border border-blue-100">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail size={14} />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => profile?.role === 'super_admin' && updateRole(user.id, user.role === 'super_admin' ? 'admin' : 'super_admin')}
                        disabled={profile?.role !== 'super_admin' || user.id === profile.id}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                          user.role === 'super_admin' 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'bg-blue-50 text-blue-600'
                        } ${
                          profile?.role === 'super_admin' && user.id !== profile.id
                            ? 'hover:brightness-95' 
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                        title={profile?.role === 'super_admin' ? "Click to toggle role" : "Role management restricted to Super Admins"}
                      >
                        {user.role === 'super_admin' ? <ShieldCheck size={14} /> : <Users size={14} />}
                        {user.role.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        user.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        user.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'approved' && (
                          <button 
                            onClick={() => profile?.role === 'super_admin' && updateStatus(user.id, 'approved')}
                            disabled={profile?.role !== 'super_admin'}
                            className={`p-2 text-emerald-500 rounded-lg transition-all ${
                              profile?.role === 'super_admin' 
                                ? 'hover:bg-emerald-50' 
                                : 'opacity-20 cursor-not-allowed'
                            }`}
                            title={profile?.role === 'super_admin' ? "Approve" : "Action restricted to Super Admins"}
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        )}
                        {user.status !== 'rejected' && user.status !== 'approved' && (
                          <button 
                            onClick={() => profile?.role === 'super_admin' && updateStatus(user.id, 'rejected')}
                            disabled={profile?.role !== 'super_admin'}
                            className={`p-2 text-red-500 rounded-lg transition-all ${
                              profile?.role === 'super_admin' 
                                ? 'hover:bg-red-50' 
                                : 'opacity-20 cursor-not-allowed grayscale'
                            }`}
                            title={profile?.role === 'super_admin' ? "Reject" : "Action restricted to Super Admins"}
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                        {user.status === 'approved' && (
                          <button 
                            onClick={() => profile?.role === 'super_admin' && updateStatus(user.id, 'disabled')}
                            disabled={profile?.role !== 'super_admin' || user.id === profile.id}
                            className={`p-2 text-gray-400 rounded-lg transition-all ${
                              profile?.role === 'super_admin' && user.id !== profile.id
                                ? 'hover:text-gray-900 hover:bg-gray-100' 
                                : 'opacity-20 cursor-not-allowed grayscale'
                            }`}
                            title={profile?.role === 'super_admin' ? "Disable Account" : "Action restricted to Super Admins"}
                          >
                            <UserX size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
