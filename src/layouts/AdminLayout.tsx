import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Award, 
  Users, 
  LogOut, 
  Menu, 
  Bell,
  Settings
} from 'lucide-react';
import { auth, signOut } from '../lib/auth';
import { adminApi } from '../lib/api';
import type { Database } from '../types/supabase';
import { onAuthStateChanged } from 'firebase/auth';

type AdminProfile = Database['public']['Tables']['admin_users']['Row'];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          navigate('/login');
          return;
        }

        try {
          const { data: adminProfile } = await adminApi.getProfile();
          
          if (adminProfile.status !== 'approved') {
            navigate('/waiting-approval');
          } else {
            setProfile(adminProfile);
          }
        } catch (error) {
          console.error('API Error:', error);
          navigate('/login');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/login');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-admin flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-admin border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/awards', icon: Award, label: 'Manage Awards' },
    { to: '/admin/users', icon: Users, label: 'Admin Users' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-screen bg-background-admin flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-admin-sidebar text-white transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div className="p-2 bg-admin rounded-xl">
              <Award size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Console</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                  ${isActive 
                    ? 'bg-admin text-white shadow-lg shadow-admin/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/5">
              <img 
                src={profile?.avatar_url || 'https://via.placeholder.com/40'} 
                alt="Profile" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{profile?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-medium"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 lg:flex items-center justify-end gap-6">
            <button className="relative p-2 text-gray-400 hover:text-admin transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ profile }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
