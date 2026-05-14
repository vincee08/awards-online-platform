import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Link as LinkIcon, 
  Info,
  Users,
  Award,
  GraduationCap,
  Calendar,
  Building2,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { adminApi } from '../../lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const awardSchema = z.object({
  award_name: z.string().min(3, 'Award or Recognition is required'),
  short_description: z.string().min(10, 'Description should be at least 10 characters'),
  student_names: z.string().min(2, 'At least one student name is required'),
  program: z.string().min(2, 'Program is required'),
  faculty_coach: z.string().optional(),
  date_awarded: z.string().min(1, 'Date is required'),
  award_giving_body: z.string().min(2, 'Award-giving body is required'),
  post_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  visibility_status: z.enum(['draft', 'published', 'hidden']),
});

type AwardFormData = z.infer<typeof awardSchema>;

const AwardForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      visibility_status: 'published',
    },
  });

  const currentImageUrl = watch('image_url');

  useEffect(() => {
    if (id) {
      fetchAward();
    }
  }, [id]);

  useEffect(() => {
    if (notification && notification.type === 'success' && isRedirecting) {
      const timer = setTimeout(() => navigate('/admin/awards'), 1500);
      return () => clearTimeout(timer);
    } else if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, isRedirecting]);

  const fetchAward = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAwardById(id);
      if (data) {
        reset(data);
        setPreviewUrl(data.image_url);
        if (data.images && Array.isArray(data.images)) {
          setAdditionalImages(data.images);
        }
      }
    } catch (error) {
      console.error('Error fetching award:', error);
      setNotification({ message: 'Error loading award data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const { data: { publicUrl } } = await adminApi.uploadImage(file);

      if (isMain) {
        setValue('image_url', publicUrl);
        setPreviewUrl(publicUrl);
      } else {
        setAdditionalImages(prev => [...prev, publicUrl]);
      }
    } catch (error: any) {
      setNotification({ message: error.message || 'Error uploading image', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setAdditionalImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const onSubmit = async (data: AwardFormData) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        images: additionalImages, // Save the gallery images
      };

      if (id) {
        await adminApi.updateAward(id, payload);
        setNotification({ message: 'Award updated successfully!', type: 'success' });
      } else {
        await adminApi.createAward(payload);
        setNotification({ message: 'Award created successfully!', type: 'success' });
      }

      setIsRedirecting(true);
    } catch (error: any) {
      console.error('Save Error:', error);
      setNotification({ 
        message: error.response?.data?.error || error.message || 'Error saving award', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="rect" className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-8 w-48" />
              <Skeleton variant="text" className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton variant="rect" className="w-24 h-12" />
            <Skeleton variant="rect" className="w-32 h-12" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton variant="text" className="h-3 w-32" />
                  <Skeleton variant="rect" className="h-14 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <Skeleton variant="text" className="h-3 w-24" />
              <Skeleton variant="rect" className="aspect-square w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/awards')}
            className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {id ? 'Edit Award' : 'Create New Award'}
            </h1>
            <p className="text-slate-500 font-medium">Capture and celebrate a new achievement record.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/awards')}
            className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading || uploading}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark disabled:opacity-50 transition-all shadow-xl shadow-primary/20 font-bold"
          >
            <Save size={20} />
            <span>{id ? 'Update Record' : 'Publish Award'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            {/* Award Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                <Award size={14} className="text-primary" />
                Award or Recognition *
              </label>
              <input
                type="text"
                {...register('award_name')}
                placeholder="e.g. Best Student Project in Digitalization"
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
              />
              {errors.award_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.award_name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                <FileText size={14} className="text-primary" />
                Short Description about the award or recognition *
              </label>
              <textarea
                {...register('short_description')}
                rows={4}
                placeholder="Describe the achievement, its impact, and why it was awarded..."
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 resize-none"
              />
              {errors.short_description && <p className="text-red-500 text-xs font-bold ml-1">{errors.short_description.message}</p>}
            </div>

            {/* Program & Giving Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  <GraduationCap size={14} className="text-primary" />
                  Program *
                </label>
                <input
                  type="text"
                  {...register('program')}
                  placeholder="e.g. BSIS"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Building2 size={14} className="text-primary" />
                  Award-giving body *
                </label>
                <input
                  type="text"
                  {...register('award_giving_body')}
                  placeholder="e.g. LGU Sto Tomas"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            {/* Student Names */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                <Users size={14} className="text-primary" />
                Student names *
              </label>
              <textarea
                {...register('student_names')}
                placeholder="Separate names with commas (e.g. John Doe, Jane Smith)"
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Secondary Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Plus size={14} className="text-primary" />
                  Faculty coach or mentor
                </label>
                <input
                  type="text"
                  {...register('faculty_coach')}
                  placeholder="e.g. Dr. Mark Van Buladaco"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Calendar size={14} className="text-primary" />
                  Date awarded or posted *
                </label>
                <input
                  type="date"
                  {...register('date_awarded')}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                <LinkIcon size={14} className="text-primary" />
                Link to post (Facebook/News)
              </label>
              <input
                type="url"
                {...register('post_link')}
                placeholder="https://facebook.com/posts/..."
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Main Media */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Main Award Media</h4>
            
            <div className="relative group aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all">
              {previewUrl || currentImageUrl ? (
                <>
                  <img src={previewUrl || currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="p-3 bg-white rounded-xl text-slate-900 cursor-pointer hover:scale-110 transition-transform">
                      <Upload size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <button 
                      onClick={() => { setPreviewUrl(null); setValue('image_url', ''); }}
                      className="p-3 bg-red-500 rounded-xl text-white hover:scale-110 transition-transform"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <div className="p-4 bg-primary/5 text-primary rounded-2xl mb-3">
                    <Upload size={32} />
                  </div>
                  <span className="text-sm font-black text-slate-900">Upload Featured Photo</span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">PNG, JPG up to 10MB</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <LinkIcon size={12} />
                Or Paste Image Link
              </label>
              <input
                type="url"
                {...register('image_url')}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-600 text-xs"
                onChange={(e) => {
                  register('image_url').onChange(e);
                  setPreviewUrl(e.target.value);
                }}
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <Info className="text-amber-500 shrink-0" size={18} />
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                Tip: Facebook links often block images. If the link doesn't show a preview above, please download and upload the file instead.
              </p>
            </div>
          </div>

          {/* Additional Gallery */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Additional Photos</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {additionalImages.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 cursor-pointer transition-all bg-slate-50/50">
                <Plus size={24} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase mt-1">Add Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
              </label>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Publish Settings</h4>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibility Status</label>
              <select
                {...register('visibility_status')}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 cursor-pointer"
              >
                <option value="published">Visible to Public</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AwardForm;
