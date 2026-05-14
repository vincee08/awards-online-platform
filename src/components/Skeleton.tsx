import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  theme?: 'light' | 'purple';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect', theme = 'light' }) => {
  const baseClass = theme === 'purple' 
    ? "bg-purple-400/10 animate-pulse" 
    : "bg-slate-200 animate-pulse";
    
  const variantClasses = {
    text: "h-4 w-full rounded",
    rect: "rounded-xl",
    circle: "rounded-full"
  };

  return (
    <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
        <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
        <Skeleton variant="rect" className="w-20 h-8" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 p-6 space-y-6">
    <Skeleton variant="rect" className="aspect-square w-full" />
    <div className="space-y-3">
      <Skeleton variant="text" className="w-2/3 h-6" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-full h-4" />
    </div>
    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <Skeleton variant="text" className="w-24" />
      </div>
      <Skeleton variant="circle" className="w-10 h-10" />
    </div>
  </div>
);

export const PurpleCardSkeleton: React.FC = () => (
  <div 
    className="rounded-[2.5rem] overflow-hidden p-8 space-y-6 h-full flex flex-col"
    style={{ background: 'rgba(74, 30, 130, 0.4)', border: '1px solid rgba(167, 139, 250, 0.15)', backdropFilter: 'blur(10px)' }}
  >
    <Skeleton variant="rect" theme="purple" className="aspect-square w-full rounded-[2rem]" />
    <div className="space-y-4 flex-1">
      <Skeleton variant="text" theme="purple" className="w-1/3 h-3" />
      <Skeleton variant="text" theme="purple" className="w-3/4 h-6" />
      <Skeleton variant="text" theme="purple" className="w-full h-4" />
    </div>
    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" theme="purple" className="w-10 h-10" />
        <div className="space-y-1.5">
          <Skeleton variant="text" theme="purple" className="w-12 h-2" />
          <Skeleton variant="text" theme="purple" className="w-20 h-3" />
        </div>
      </div>
      <Skeleton variant="circle" theme="purple" className="w-10 h-10" />
    </div>
  </div>
);

export default Skeleton;
