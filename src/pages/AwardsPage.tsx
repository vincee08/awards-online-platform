import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  ExternalLink,
  X,
  Award,
  ChevronRight,
  ChevronLeft,
  Globe,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { PurpleCardSkeleton } from '../components/Skeleton';
import { AlertCircle } from 'lucide-react';

const AwardsPage: React.FC = () => {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [programs, setPrograms] = useState<string[]>(['All']);
  const [selectedAward, setSelectedAward] = useState<any | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [previewError, setPreviewError] = useState(false);
  const itemsPerPage = 3;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedAward || showGallery) {
      document.body.style.overflow = 'hidden';
      
      // Check if link is likely to be blocked by iframes
      if (selectedAward?.post_link) {
        const blockedDomains = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 't.co', 'x.com'];
        const isBlocked = blockedDomains.some(domain => selectedAward.post_link.toLowerCase().includes(domain));
        setPreviewError(isBlocked);
      }
    } else {
      document.body.style.overflow = 'unset';
      setPreviewError(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedAward, showGallery]);

  useEffect(() => {
    fetchAwards();
  }, []);

  // Reset to first page when search or program filter changes
  useEffect(() => {
    setDirection(1);
    setCurrentPage(0);
  }, [searchQuery, selectedProgram]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('visibility_status', 'published')
        .order('date_awarded', { ascending: false });

      if (error) throw error;
      setAwards(data || []);
      
      const uniquePrograms = Array.from(new Set((data || []).map((a: any) => a.program)));
      setPrograms(['All', ...uniquePrograms]);
    } catch (err: any) {
      console.error('Error fetching awards:', err);
      setError('Unable to load achievements at this moment. Please try again later.');
    } finally {
      // Small delay for smooth transition
      setTimeout(() => setLoading(false), 800);
    }
  };

  const filteredAwards = awards.filter(award => {
    const matchesSearch = 
      award.award_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.student_names.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.program.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProgram = selectedProgram === 'All' || award.program === selectedProgram;
    
    return matchesSearch && matchesProgram;
  });

  const totalPages = Math.ceil(filteredAwards.length / itemsPerPage);
  const paginatedAwards = filteredAwards.slice(
    currentPage * itemsPerPage,
    (currentPage * itemsPerPage) + itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const paginationVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
    }),
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #5A1FA3 0%, #42147A 45%, #12051F 100%)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 border-b" style={{ background: 'rgba(74, 30, 130, 0.55)', borderBottom: '1px solid rgba(167, 139, 250, 0.25)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <Link to="/" className="flex items-center gap-2 md:gap-4 overflow-hidden hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <img src="/logo/awardsSystem-logo.png" alt="Institute Awards" className="h-10 w-auto md:h-12 object-contain shrink-0" />
              <div className="truncate">
                <span className="font-black text-white text-base md:text-xl tracking-tighter block leading-none truncate">Institute Awards</span>
                <span className="text-[8px] md:text-[10px] font-black text-purple-300 uppercase tracking-[0.1em] md:tracking-[0.2em] block mt-1">Online Platform</span>
              </div>
            </div>
          </Link>
          <Link 
            to="/"
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-white/10 text-white rounded-xl md:rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20 shrink-0 text-xs md:text-sm"
          >
            <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-12 px-6 relative overflow-hidden text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Browse Achievements
        </h1>
        <p className="text-purple-200 font-medium max-w-2xl mx-auto">
          Explore the collective excellence of the DNSC Institute Awards community.
        </p>
      </header>

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="p-4 rounded-[2.5rem] flex flex-col md:flex-row gap-4" style={{ background: 'rgba(74, 30, 130, 0.55)', border: '1px solid rgba(167, 139, 250, 0.25)', backdropFilter: 'blur(12px)' }}>
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
            <input 
              type="text" 
              placeholder="Search awards, students, programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-black/20 rounded-3xl border-none outline-none focus:ring-2 focus:ring-purple-400/50 transition-all font-bold text-white placeholder-purple-300"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 px-2">
            <Filter size={18} className="text-purple-300 mr-2 shrink-0" />
            {programs.map(program => (
              <button
                key={program}
                onClick={() => setSelectedProgram(program)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                  selectedProgram === program 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-purple-200 hover:bg-white/10 border border-white/10'
                }`}
              >
                {program}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3].map(i => <PurpleCardSkeleton key={i} />)}
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-6 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center text-red-400">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Oops! Something went wrong</h3>
                <p className="text-purple-300 font-medium max-w-sm mx-auto">{error}</p>
              </div>
              <button 
                onClick={fetchAwards}
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredAwards.length > 0 ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
            <div className="min-h-[600px] relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={paginationVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {paginatedAwards.map((award) => (
                    <motion.div
                      key={award.id}
                      onClick={() => setSelectedAward(award)}
                      className="group rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full"
                      style={{ background: 'rgba(74, 30, 130, 0.55)', border: '1px solid rgba(167, 139, 250, 0.25)', backdropFilter: 'blur(12px)' }}
                    >
                      {/* Image Area */}
                      <div className="aspect-square relative overflow-hidden bg-[#2B0F54]">
                        {/* 1. Base Layer: Trophy Placeholder (Always present) */}
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 scale-[3] bg-primary/20 rounded-full blur-3xl animate-pulse" />
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border-2 border-white/20 shadow-2xl relative z-10 overflow-hidden">
                              <Trophy size={64} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] relative z-20" />
                            </div>
                          </div>
                        </div>

                        {/* 2. Top Layer: Actual Award Image (Hides placeholder if loaded) */}
                        {award.image_url && award.image_url.trim() !== "" && (
                          <img 
                            src={award.image_url} 
                            alt={award.award_name}
                            className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* 3. Overlay Layer: Program Badge (Always on top) */}
                        <div className="absolute top-4 left-4 z-20">
                          <div className="px-3 py-1.5 bg-[#42147A]/90 backdrop-blur-md rounded-xl shadow-lg shadow-black/20 flex items-center gap-2 border border-[#A78BFA]/30">
                            <div className="w-5 h-5 bg-primary/20 rounded-lg flex items-center justify-center">
                              <Trophy size={12} className="text-purple-300" />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                              {award.program}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-8 space-y-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-black text-purple-300 uppercase tracking-widest">
                          <Calendar size={14} />
                          <span>{new Date(award.date_awarded).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        
                        <h3 className="text-xl font-black text-white leading-tight group-hover:text-primary-light transition-colors line-clamp-2">
                          {award.award_name}
                        </h3>
                        
                        <p className="text-purple-200 text-sm font-medium line-clamp-2 leading-relaxed flex-1">
                          {award.short_description}
                        </p>

                        <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-300 border border-white/5">
                              <Users size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Recipient(s)</span>
                              <span className="text-xs font-black text-white truncate max-w-[120px]">{award.student_names}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg shadow-primary/30">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 pt-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      currentPage === 0
                        ? 'opacity-30 cursor-not-allowed bg-white/5 text-purple-300'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 active:scale-95 shadow-xl shadow-black/20'
                    }`}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          currentPage === i 
                            ? 'bg-primary w-8 shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      currentPage === totalPages - 1
                        ? 'opacity-30 cursor-not-allowed bg-white/5 text-purple-300'
                        : 'bg-primary text-white hover:bg-primary-light active:scale-95 shadow-xl shadow-primary/30'
                    }`}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">
                  Showing <span className="text-white">{currentPage * itemsPerPage + 1}</span> to <span className="text-white">{Math.min((currentPage + 1) * itemsPerPage, filteredAwards.length)}</span> of <span className="text-white">{filteredAwards.length}</span> achievements
                </p>
              </div>
            )}
            </motion.div>
          ) : (
            <div className="text-center py-40 space-y-4">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-purple-300">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-black text-white">No achievements found</h3>
              <p className="text-purple-300 font-medium">Try adjusting your search or program filters.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Award Details Modal */}
      <AnimatePresence>
        {selectedAward && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAward(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full ${selectedAward.post_link ? 'max-w-7xl' : 'max-w-3xl'} bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] isolation-auto`}
              style={{ isolation: 'isolate' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedAward(null)}
                className="absolute top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:rotate-90 shadow-sm border border-slate-100"
              >
                <X size={20} />
              </button>

              {/* Modal Left Side (Content) */}
              <div className={`w-full ${selectedAward.post_link ? 'md:w-1/2' : ''} bg-white flex flex-col min-h-0 relative border-r border-slate-200/60`}>
                <div className="flex-1 overflow-hidden p-4 md:p-10 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth modal-scrollbar">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full mb-6">
                      <Calendar size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{new Date(selectedAward.date_awarded).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.1]">
                      {selectedAward.award_name}
                    </h2>

                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full" />
                        <div className="pl-6 py-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            <FileText size={14} />
                            <span>Award Narrative</span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                            {selectedAward.short_description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recognized Students</p>
                          <p className="text-sm font-bold text-slate-900">{selectedAward.student_names}</p>
                        </div>

                        <div className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Building2 size={20} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Granting Authority</p>
                          <p className="text-sm font-bold text-slate-900">{selectedAward.award_giving_body}</p>
                        </div>
                      </div>

                      {selectedAward.faculty_coach && (
                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-3xl flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                            <Award size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Faculty Mentor</p>
                            <p className="text-base font-bold text-slate-900">{selectedAward.faculty_coach}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex flex-col gap-3">
                        {selectedAward.post_link && (
                          <a 
                            href={selectedAward.post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 group"
                          >
                            <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                            <span>Explore Full Evidence</span>
                          </a>
                        )}

                        {(() => {
                          let images: string[] = [];
                          try {
                            if (Array.isArray(selectedAward.images)) images = selectedAward.images;
                            else if (typeof selectedAward.images === 'string') {
                              if (selectedAward.images.startsWith('[')) images = JSON.parse(selectedAward.images);
                              else if (selectedAward.images) images = [selectedAward.images];
                            }
                          } catch (e) { console.error('Error parsing images', e); }

                          return images.length > 0 ? (
                            <button
                              onClick={() => {
                                setCurrentImageIndex(0);
                                setShowGallery(true);
                              }}
                              className="w-full h-14 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 group"
                            >
                              <ImageIcon size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                              <span>View Award Photos ({images.length})</span>
                            </button>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Right Side (Embedded Browser Preview) */}
              {selectedAward.post_link && (
                <div className="w-full md:w-1/2 bg-violet-50 relative flex flex-col h-[40vh] md:h-auto z-10">
                  {/* Premium Browser Header */}
                  <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    </div>
                    <div className="flex-1 max-w-sm mx-4 bg-slate-100/80 rounded-full px-6 py-2.5 flex items-center gap-2 border border-slate-200/50 shadow-inner">
                      <Globe size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-500 truncate font-semibold font-mono tracking-tight">
                        {selectedAward.post_link.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Browser Content */}
                  <div className="flex-1 relative bg-slate-50 overflow-hidden group/browser">
                    {/* Fallback Message (Visible only on error) */}
                    <AnimatePresence>
                      {previewError && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center bg-slate-50"
                        >
                          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
                            <Globe size={32} className="text-primary animate-pulse" />
                          </div>
                          <h3 className="text-slate-900 font-black text-lg mb-2">Preview Unavailable</h3>
                          <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed mb-8">
                            This platform prevents direct embedding. Please view the evidence in a new tab.
                          </p>
                          <a 
                            href={selectedAward.post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group/btn"
                          >
                            <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span>Open in New Tab</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!previewError && (
                      <iframe 
                        src={selectedAward.post_link}
                        title="Evidence Link Preview"
                        className="absolute inset-0 w-full h-full border-none z-10 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        onError={() => setPreviewError(true)}
                        onLoad={() => {
                          // Note: Standard X-Frame-Options blocks don't trigger onError, 
                          // so we rely on domain detection + manual fallback if needed.
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-16 px-6" style={{ background: 'transparent', borderTop: '1px solid rgba(167, 139, 250, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-8 w-full">
            <div className="flex flex-col items-center md:items-start gap-4 w-full">
              {/* Footer Logos & Icon Group */}
              <div className="flex items-center justify-center md:justify-start gap-4 w-full">
                <div className="flex items-center gap-3 pr-4 md:border-r md:border-white/10">
                  <img 
                    src="/assets/logos/dnsc.jpg" 
                    alt="DNSC Logo" 
                    className="w-10 h-10 rounded-full object-cover logo-dnsc-glow"
                  />
                  <img 
                    src="/assets/logos/ic.png" 
                    alt="IC Logo" 
                    className="h-10 w-auto rounded-lg object-contain logo-ic-glow"
                  />
                  <img src="/logo/awardsSystem-logo.png" alt="Institute Awards Logo" className="h-10 w-auto object-contain md:hidden" />
                </div>
                
                <div className="flex items-center gap-3">
                  <img src="/logo/awardsSystem-logo.png" alt="Institute Awards Logo" className="h-10 w-auto object-contain hidden md:block" />
                  <div className="text-center md:text-left">
                    <span className="font-black text-white text-2xl md:text-3xl tracking-tighter block leading-none">Institute Awards</span>
                    <span className="text-[10px] md:text-xs font-black text-purple-300 uppercase tracking-[0.3em] block mt-2">Online Platform</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-purple-200 text-sm max-w-xs font-medium text-center md:text-left">
              Documenting the legacy of excellence and the spirit of academic achievement.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest">
              © {new Date().getFullYear()} Institute Awards Online Platform
            </p>
            <p className="text-purple-300 text-xs font-medium">
              Designed for Higher Education Recognition
            </p>
          </div>
        </div>
      </footer>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && selectedAward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4"
            onClick={() => setShowGallery(false)}
          >
            <button 
              onClick={() => setShowGallery(false)}
              className="absolute top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white/70 hover:text-white transition-all hover:rotate-90 hover:bg-white/20"
            >
              <X size={24} />
            </button>
            
            <div className="relative w-full max-w-5xl h-full max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              {(() => {
                let images: string[] = [];
                try {
                  if (Array.isArray(selectedAward.images)) images = selectedAward.images;
                  else if (typeof selectedAward.images === 'string') {
                    if (selectedAward.images.startsWith('[')) images = JSON.parse(selectedAward.images);
                    else if (selectedAward.images) images = [selectedAward.images];
                  }
                } catch (e) { console.error('Error parsing images', e); }

                return images.length > 0 ? (
                  <>
                    <motion.img 
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      src={images[currentImageIndex]} 
                      alt="Award" 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1); }}
                          className="absolute left-4 md:-left-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0); }}
                          className="absolute right-4 md:-right-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                        >
                          <ChevronRight size={24} />
                        </button>
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold tracking-widest border border-white/10">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-white/50 font-bold uppercase tracking-widest">No images available</div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const FileText = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const Building2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

export default AwardsPage;
