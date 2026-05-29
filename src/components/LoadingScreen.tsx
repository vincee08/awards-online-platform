import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster, smaller updates for ultra-smooth feel
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Very small increments for fluidity
        const increment = Math.random() * 2 + 1; 
        return Math.min(prev + increment, 100);
      });
    }, 40); // 25 updates per second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#42147A]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm px-10"
      >
        <div className="relative mb-12">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 relative z-10"
          >
            <Award className="text-primary w-12 h-12" />
          </motion.div>
          <div className="absolute inset-0 bg-primary/30 blur-[40px] -z-10 rounded-full animate-pulse" />
        </div>

        <div className="text-center w-full space-y-10">
          <div className="space-y-3">
            <h2 className="text-white font-black text-2xl md:text-3xl tracking-tighter">Institute Awards</h2>
            <p className="text-purple-300 text-[10px] font-black uppercase tracking-[0.5em] opacity-80">
              Online Platform
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-end px-1">
              <div className="flex flex-col items-start">
                <span className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-1">
                  {progress < 100 ? 'Curating Excellence' : 'Platform Ready'}
                </span>
                <div className="flex gap-1">
                  <motion.span 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                    className="w-1 h-1 bg-purple-400 rounded-full" 
                  />
                  <motion.span 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    className="w-1 h-1 bg-purple-400 rounded-full" 
                  />
                  <motion.span 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                    className="w-1 h-1 bg-purple-400 rounded-full" 
                  />
                </div>
              </div>
              <span className="text-white font-black text-2xl tabular-nums leading-none">
                {Math.floor(progress)}<span className="text-sm ml-0.5 opacity-50">%</span>
              </span>
            </div>
            
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 p-1 backdrop-blur-sm">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-purple-400 to-white rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              >
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
