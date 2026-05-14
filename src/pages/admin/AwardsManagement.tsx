import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter,
  Image as ImageIcon,
  Users,
  GraduationCap,
  Award
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Database } from '../../types/supabase';
import { Link, useOutletContext } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Skeleton, { TableSkeleton } from '../../components/Skeleton';

type Award = Database['public']['Tables']['awards']['Row'];
type AdminProfile = Database['public']['Tables']['admin_users']['Row'];

const AwardsManagement: React.FC = () => {
  const { profile } = useOutletContext<{ profile: AdminProfile }>();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [awardToArchive, setAwardToArchive] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAwards(data || []);
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setAwardToArchive(id);
    setIsModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!awardToArchive) return;
    
    try {
      setIsArchiving(true);
      // Soft Delete: Just update status to 'hidden' via API
      await adminApi.archiveAward(awardToArchive);

      // Update local state to remove it from view
      setAwards(awards.filter(a => a.id !== awardToArchive));
      setNotification({ message: 'Award archived and hidden successfully', type: 'success' });
    } catch (error: any) {
      setNotification({ message: error.message || 'Error archiving award', type: 'error' });
    } finally {
      setIsArchiving(false);
      setIsModalOpen(false);
      setAwardToArchive(null);
    }
  };

  const filteredAwards = awards.filter(a => 
    a.visibility_status !== 'hidden' && (
      a.award_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.student_names && a.student_names.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <AnimatePresence>
        {notification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 flex flex-col items-center gap-4 max-w-sm text-center"
            >
              <div className={`p-4 rounded-2xl ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                {notification.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{notification.type === 'success' ? 'Success!' : 'Error'}</h3>
                <p className="text-slate-500 font-medium text-sm">{notification.message}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isArchiving && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col items-center gap-6 max-w-sm text-center relative z-10"
            >
              <div className="p-5 rounded-[2rem] bg-red-50 text-red-500 shadow-inner">
                <AlertCircle size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Archive Award?</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Are you sure you want to archive this award? It will be hidden from the system but kept in the database.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  disabled={isArchiving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isArchiving}
                  onClick={confirmArchive}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isArchiving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Archive'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Awards</h1>
          <p className="text-gray-500 font-medium">Add, edit, or remove achievement records and recognitions.</p>
        </div>
        <Link 
          to="/admin/awards/add"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-admin text-white rounded-2xl hover:bg-admin-dark transition-all shadow-xl shadow-admin/20 font-bold"
        >
          <Plus size={20} />
          <span>New Award</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by award, program, or student name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-4 focus:ring-admin/10 focus:border-admin outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-bold tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">Award Details</th>
                <th className="px-8 py-5">Program</th>
                <th className="px-8 py-5">Students</th>
                <th className="px-8 py-5 text-center">Date Awarded</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-4">
                    <TableSkeleton rows={6} />
                  </td>
                </tr>
              ) : filteredAwards.length > 0 ? (
                filteredAwards.map((award, idx) => (
                  <motion.tr 
                    key={award.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center relative">
                          {award.image_url ? (
                            <>
                              <img 
                                src={award.image_url} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.fallback-icon');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              <div className="fallback-icon hidden text-gray-300">
                                <Award size={24} />
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-300">
                              <Award size={24} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[250px] text-lg leading-tight mb-1">{award.award_name}</p>
                          <p className="text-sm text-gray-400 truncate max-w-[250px] font-medium">{award.award_giving_body}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                        <GraduationCap size={14} />
                        {award.program}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <Users size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {award.student_names || 'No names listed'}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-bold text-gray-700">
                        {award.date_awarded ? new Date(award.date_awarded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        award.visibility_status === 'published' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          award.visibility_status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {award.visibility_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <Link 
                          to={`/admin/awards/edit/${award.id}`}
                          className="p-3 text-gray-400 hover:text-admin hover:bg-admin/10 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-gray-50"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        {profile?.role === 'super_admin' && (
                          <button 
                            onClick={() => handleDelete(award.id)}
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-gray-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <a 
                          href={award.post_link || '#'} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-gray-50 ${!award.post_link ? 'cursor-not-allowed opacity-30' : ''}`}
                          title="View Original Post"
                        >
                          <Eye size={18} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-gray-500">
                    No awards found. Create your first recognition entry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AwardsManagement;
