import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Users, User as UserIcon, Calendar, MapPin, BookOpen, CheckCircle2, XCircle, BookText } from 'lucide-react';

interface MenteeHomeProps {
  user: User;
  displayName: string;
}

export default function MenteeHome({ user, displayName, userRole }: MenteeHomeProps & { userRole?: string }) {
  const [membership, setMembership] = useState<any>(null);
  const [menteeBooks, setMenteeBooks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [batchModules, setBatchModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenteeDetails() {
      setLoading(true);
      // Fetch active batch membership
      const { data, error } = await supabase
        .from('batch_memberships')
        .select(`
          id,
          batch_id,
          batches (
            id,
            name,
            schedule,
            location,
            mentor_id,
            users!mentor_id (
              id,
              full_name,
              initiated_name,
              phone,
              email
            )
          )
        `)
        .eq('mentee_id', user.id)
        .is('left_at', null)
        .single();
        
      if (data && !error) {
        setMembership(data);
      }
      
      // Fetch books progress
      const { data: booksData } = await supabase
        .from('mentee_books')
        .select('*, prabhupada_books(title)')
        .eq('user_id', user.id)
        .order('status', { ascending: false });
        
      if (booksData) {
        setMenteeBooks(booksData);
      }
      
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*, sessions(session_date)')
        .eq('mentee_id', user.id)
        .order('created_at', { ascending: false });
        
      if (attendanceData) {
        setAttendance(attendanceData.sort((a,b) => new Date(b.sessions?.session_date).getTime() - new Date(a.sessions?.session_date).getTime()));
      }
      
      if (data && data.batch_id) {
         // Fetch batch modules
         const { data: bmData } = await supabase
            .from('batch_modules')
            .select('*, modules(*)')
            .eq('batch_id', data.batch_id);
            
         if (bmData) {
            setBatchModules(bmData.sort((a,b) => a.modules?.order_index - b.modules?.order_index));
         }
      }
      setLoading(false);
    }
    
    fetchMenteeDetails();
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-sankirtan-panel-dark via-sankirtan-panel-dark to-sankirtan-bg-dark rounded-3xl shadow-2xl p-8 md:p-12 border border-sankirtan-border-dark text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-sankirtan-gold-dark/5 blur-[80px] pointer-events-none"></div>
        <div className="w-12 h-12 md:w-16 md:h-16 bg-sankirtan-bg-dark rounded-full flex items-center justify-center border border-sankirtan-border-dark shadow-inner mx-auto mb-4 md:mb-6">
          <UserIcon className="w-6 h-6 md:w-8 md:h-8 text-sankirtan-gold-dark" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome, {displayName}</h2>
        <p className="text-sm md:text-base text-sankirtan-muted-dark max-w-lg mx-auto">
          {userRole !== 'admin' && userRole !== 'mentor' ? 'Hare Krishna! Use the menu to access your sadhana tracker, courses, and other features.' : 'Hare Krishna! Access your panel via the top-right menu to manage activities.'}
        </p>
      </div>

      {userRole !== 'admin' && userRole !== 'mentor' && (<div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-sankirtan-text-dark mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-sankirtan-gold-dark" />
          My Batch
        </h3>
        
        {loading ? (
             <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : membership ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                 <p className="text-sm text-sankirtan-muted-dark font-medium uppercase tracking-wider mb-1">Batch Details</p>
                 <div className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/50 p-5 rounded-2xl border border-sankirtan-border-dark/60 shadow-inner">
                    <p className="font-bold text-lg">{membership.batches?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-sankirtan-muted-dark mt-2">
                      <Calendar className="w-4 h-4" /> {membership.batches?.schedule || 'Schedule not set'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-sankirtan-muted-dark mt-1">
                      <MapPin className="w-4 h-4" /> {membership.batches?.location || 'Location not set'}
                    </div>
                 </div>
               </div>
            </div>
            <div className="space-y-4">
               <div>
                 <p className="text-sm text-sankirtan-muted-dark font-medium uppercase tracking-wider mb-1">My Mentor</p>
                 <div className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/50 p-5 rounded-2xl border border-sankirtan-border-dark/60 shadow-inner">
                    <p className="font-bold text-lg">{membership.batches?.users?.initiated_name || membership.batches?.users?.full_name}</p>
                    <p className="text-sm text-sankirtan-muted-dark mt-1">{membership.batches?.users?.email}</p>
                    {membership.batches?.users?.phone && (
                      <p className="text-sm text-sankirtan-gold-dark mt-1">{membership.batches?.users?.phone}</p>
                    )}
                 </div>
               </div>
            </div>
          </div>
        ) : (
           <div className="text-center py-8 bg-sankirtan-bg-dark rounded-xl border border-sankirtan-border-dark border-dashed">
             <p className="text-sankirtan-muted-dark">You are not assigned to any batch yet.</p>
           </div>
        )}
      
        <h3 className="text-xl font-bold text-sankirtan-text-dark mt-8 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sankirtan-gold-dark" />
          My Reading Progress
        </h3>
        
        {loading ? (
             <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : menteeBooks.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menteeBooks.map(mb => (
                 <div key={mb.id} className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/50 p-4 rounded-xl border border-sankirtan-border-dark/60 shadow-inner flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${mb.status === 'completed' ? 'bg-sankirtan-green-dark/10 border-sankirtan-green-dark/30 text-sankirtan-green-dark' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                       <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="font-bold text-[13px] line-clamp-2">{mb.prabhupada_books?.title}</p>
                       <p className="text-[11px] text-sankirtan-muted-dark capitalize uppercase font-medium tracking-wider mt-1">{mb.status.replace('_', ' ')}</p>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-6 bg-sankirtan-bg-dark rounded-xl border border-sankirtan-border-dark border-dashed">
             <p className="text-sm text-sankirtan-muted-dark">No book progress recorded yet.</p>
           </div>
        )}
      
        <h3 className="text-xl font-bold text-sankirtan-text-dark mt-8 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sankirtan-gold-dark" />
          My Attendance
        </h3>
        
        {loading ? (
             <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : attendance.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendance.map(a => (
                 <div key={a.id} className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/50 p-4 rounded-xl border border-sankirtan-border-dark/60 shadow-inner flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${a.status === 'present' ? 'bg-sankirtan-green-dark/10 border-sankirtan-green-dark/30 text-sankirtan-green-dark' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                       {a.status === 'present' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="font-bold text-[13px]">{new Date(a.sessions?.session_date || a.created_at).toLocaleDateString()}</p>
                       <p className="text-[11px] text-sankirtan-muted-dark capitalize uppercase font-medium tracking-wider mt-1">{a.status}</p>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-6 bg-sankirtan-bg-dark rounded-xl border border-sankirtan-border-dark border-dashed">
             <p className="text-sm text-sankirtan-muted-dark">No attendance records yet.</p>
           </div>
        )}
      
        <h3 className="text-xl font-bold text-sankirtan-text-dark mt-8 mb-4 flex items-center gap-2">
          <BookText className="w-5 h-5 text-sankirtan-gold-dark" />
          Batch Modules Progress
        </h3>
        
        {loading ? (
             <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : batchModules.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchModules.map(bm => (
                 <div key={bm.id} className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/50 p-5 rounded-2xl border border-sankirtan-border-dark/60 shadow-inner flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                       <p className="text-xs text-sankirtan-gold-dark font-bold uppercase tracking-wider mb-1">Module {bm.modules?.order_index}</p>
                       <h4 className="text-[15px] font-bold">{bm.modules?.title}</h4>
                    </div>
                    <div className="shrink-0">
                       <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${bm.status === 'completed' ? 'bg-sankirtan-green-dark/20 text-sankirtan-green-dark border border-sankirtan-green-dark/20' : bm.status === 'in_progress' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-sankirtan-panel-dark text-sankirtan-muted-dark border border-sankirtan-border-dark'}`}>
                          {bm.status.replace('_', ' ').toUpperCase()}
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-6 bg-sankirtan-bg-dark rounded-xl border border-sankirtan-border-dark border-dashed">
             <p className="text-sm text-sankirtan-muted-dark">No modules tracked for your batch yet.</p>
           </div>
        )}
      </div>
      )}
    </div>
  );
}
