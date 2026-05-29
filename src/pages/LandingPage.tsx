import React from 'react';
import { 
  Trophy, 
  ArrowRight, 
  Award,
  Search,
  Globe,
  Users,
  ShieldCheck,
  Rocket,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import LoadingScreen from '../components/LoadingScreen';

const LandingPage: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #5A1FA3 0%, #42147A 45%, #12051F 100%)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 border-b" style={{ background: 'rgba(74, 30, 130, 0.55)', borderBottom: '1px solid rgba(167, 139, 250, 0.25)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <img src="/logo/awardsSystem-logo.png" alt="Institute Awards" className="h-10 w-auto md:h-12 object-contain shrink-0" />
            <div className="truncate">
              <span className="font-black text-white text-base md:text-xl tracking-tighter block leading-none truncate">Institute Awards</span>
              <span className="text-[8px] md:text-[10px] font-black text-purple-300 uppercase tracking-[0.1em] md:tracking-[0.2em] block mt-1">Online Platform</span>
            </div>
          </div>
          
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/awards" className="text-sm font-bold text-purple-200 hover:text-white transition-colors">Browse</Link>
            <a href="#about" className="text-sm font-bold text-purple-200 hover:text-white transition-colors">About</a>
            <a href="#features" className="text-sm font-bold text-purple-200 hover:text-white transition-colors">Features</a>
          </div>

          <Link 
            to="/login"
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-white/10 text-white rounded-xl md:rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20 shrink-0 text-xs md:text-sm"
          >
            <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Admin Login</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-6">
              {/* Institutional Logos in Hero */}
              <div className="flex items-center gap-4 lg:pr-6 lg:border-r lg:border-white/10">
                <img 
                  src="/assets/logos/dnsc.jpg" 
                  alt="DNSC Logo" 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover logo-dnsc-glow shadow-2xl"
                />
                <img 
                  src="/assets/logos/ic.png" 
                  alt="IC Logo" 
                  className="h-12 md:h-14 w-auto rounded-xl object-contain logo-ic-glow shadow-2xl"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full shadow-sm border border-purple-400/30 backdrop-blur-md"
              >
                <Trophy size={16} className="text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Celebrating IC Excellence</span>
              </motion.div>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.95]"
            >
              Legacy of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300 italic">Achievement.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-purple-100 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-90"
            >
              The official awards platform for the Institute Awards at Davao del Norte State College, Panabo. Dedicated to documenting, celebrating, and sharing the remarkable successes of our academic community.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link 
                to="/awards"
                className="group relative flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <span>Browse Achievements</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#about"
                className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl group">
              <img 
                src="/assets/images/hero.png" 
                alt="Celebrating Excellence"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B0F54]/80 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-sm font-bold text-white/90">"Empowering the next generation of computing leaders through recognition and inspiration."</p>
              </div>
            </div>
            
            {/* Decorative Orbs */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Institutional Excellence</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
          </div>
          <p className="text-xl text-purple-100 font-medium leading-relaxed">
            The Institute Awards Online Platform serves as a living archive for the Davao del Norte State College community. It is designed to preserve records of student achievements and institutional recognitions, making them easily accessible and shareable with the world.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-center">
              <div className="text-4xl font-black text-white mb-2">Digital</div>
              <div className="text-purple-300 font-bold uppercase tracking-widest text-xs">Preservation</div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-center">
              <div className="text-4xl font-black text-white mb-2">Public</div>
              <div className="text-purple-300 font-bold uppercase tracking-widest text-xs">Recognition</div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-center">
              <div className="text-4xl font-black text-white mb-2">Shared</div>
              <div className="text-purple-300 font-bold uppercase tracking-widest text-xs">Inspiration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - "What You Can Do" */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">What You Can Do</h2>
            <p className="text-purple-300 font-bold uppercase tracking-widest text-sm">Empowering Users with Information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                <Trophy size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">Browse Awards</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Explore a comprehensive gallery of student awards and recognitions achieved by the IC community.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">View Evidence</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Access detailed information, photos, and live evidence links for every documented achievement.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">Smart Search</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Search achievements by student name, program, or category to find specific recognitions quickly.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">Celebrate Success</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Join the DNSC Institute in celebrating the spirit of innovation and institutional excellence.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">Admin Access</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Authorized administrators can manage, edit, and publish new award records through a secure platform.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] space-y-6"
              style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.2)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400">
                <Rocket size={32} />
              </div>
              <h3 className="text-2xl font-black text-white">Inspire Others</h3>
              <p className="text-purple-200 font-medium leading-relaxed">
                Motivate fellow students by showcasing what is possible through hard work and dedication in computing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[4rem] text-center space-y-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Ready to see the <br /> accomplishments?</h2>
          <p className="text-purple-100 text-lg font-medium opacity-80 max-w-xl mx-auto">
            Take a look at the documented success stories of the Institute's brightest students.
          </p>
          <Link 
            to="/awards"
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black text-base uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            <span>View All Awards</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

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
    </div>
  );
};

export default LandingPage;
