import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Users, Clock, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { adminApi } from '../../lib/api';
import Skeleton from '../../components/Skeleton';

const Dashboard: React.FC = () => {
  const { data: stats = {
    totalAwards: 0,
    approvedAdmins: 0,
    pendingRequests: 0,
    recentAwards: [] as any[],
  }, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await adminApi.getStats();
      return data;
    }
  });

  const cards = [
    { label: 'Total Awards', value: stats.totalAwards, icon: Award, color: 'bg-blue-500' },
    { label: 'Active Admins', value: stats.approvedAdmins, icon: Users, color: 'bg-emerald-500' },
    { label: 'Pending Admins', value: stats.pendingRequests, icon: Clock, color: 'bg-amber-500' },
    { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="text" className="h-4 w-64" />
          </div>
          <Skeleton variant="rect" className="w-32 h-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
              <Skeleton variant="rect" className="w-14 h-14" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="h-3 w-1/2" />
                <Skeleton variant="text" className="h-6 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-6 w-40" />
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0">
                <Skeleton variant="rect" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-1/3" />
                  <Skeleton variant="text" className="h-3 w-1/4" />
                </div>
                <Skeleton variant="rect" className="w-16 h-8" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton variant="rect" className="h-48 w-full" />
            <Skeleton variant="rect" className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {cards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
          >
            <div className={`p-4 ${card.color} rounded-2xl text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Recent Awards */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recently Added Awards</h3>
            <button className="text-sm font-bold text-admin hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentAwards.map((award) => (
              <div key={award.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
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
                        <Award size={20} />
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-300">
                      <Award size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{award.award_name}</p>
                  <p className="text-sm text-gray-500 truncate">{award.program}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(award.created_at).toLocaleDateString()}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    award.visibility_status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {award.visibility_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-admin-navy rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-admin-light text-sm mb-6">Check our documentation or contact the super admin for access issues.</p>
              <button className="w-full py-3 bg-white text-admin-navy rounded-xl font-bold hover:bg-admin-light transition-colors">
                Support Center
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white/5 transform rotate-12">
              <Award size={160} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Pending Approvals</span>
                <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-1 rounded-lg">
                  {stats.pendingRequests} New
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Super admins can approve or reject pending requests in the Admin Users section.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
