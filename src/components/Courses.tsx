import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { BookOpen, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export default function Courses({ user }: { user: User }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingCourse, setSubmittingCourse] = useState<any>(null);
  const [menteeNotes, setMenteeNotes] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch all active courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .order('title');
        
      if (coursesData) setCourses(coursesData);

      // Fetch user's completions
      const { data: completionsData } = await supabase
        .from('course_completions')
        .select('*')
        .eq('user_id', user.id);
        
      if (completionsData) setCompletions(completionsData);
      setLoading(false);
    }
    fetchData();
  }, [user.id]);

  const startCourse = async (courseId: string) => {
      const payload = {
        user_id: user.id,
        course_id: courseId,
        status: 'in_progress'
      };
      const { data } = await supabase.from('course_completions').insert(payload).select().single();
      if (data) {
        setCompletions([...completions, data]);
      }
  };
  
  const submitCourse = async () => {
     if(!submittingCourse) return;
     const existing = completions.find(c => c.course_id === submittingCourse.id);
     if(existing) {
       const payload = { status: 'pending_review', submitted_at: new Date().toISOString(), mentee_notes: menteeNotes };
       await supabase.from('course_completions').update(payload).eq('id', existing.id);
       setCompletions(completions.map(c => c.id === existing.id ? { ...c, ...payload } : c));
     }
     setSubmittingCourse(null);
     setMenteeNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sankirtan-gold-dark" />
          My Courses
        </h2>
      </div>

      <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : courses.length === 0 ? (
          <p className="text-sankirtan-muted-dark text-center py-10">No active courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => {
              const comp = completions.find(c => c.course_id === course.id);
              const status = comp?.status || 'not_started';
              
              return (
                <div key={course.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl p-4 hover:border-sankirtan-gold-dark/50 transition-colors flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       {status === 'completed' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3"/> Approved</span>
                       ) : status === 'in_progress' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> In Progress</span>
                       ) : status === 'pending_review' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-sankirtan-orange-dark bg-sankirtan-orange-dark/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Pending Review</span>
                       ) : status === 'rejected' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Rejected</span>
                       ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-sankirtan-muted-dark bg-sankirtan-border-dark/50 px-2 py-1 rounded-full"><PlayCircle className="w-3 h-3"/> Not Started</span>
                       )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                     {status === 'not_started' && (
                       <button 
                         onClick={() => startCourse(course.id)}
                         className="w-full py-2 bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark hover:bg-sankirtan-gold-dark/10 hover:text-sankirtan-gold-dark transition-colors rounded-lg text-sm font-semibold"
                       >
                          Start Course
                       </button>
                     )}
                     {status === 'in_progress' && (
                       <button 
                         onClick={() => setSubmittingCourse(course)}
                         className="w-full py-2 bg-sankirtan-gold-dark text-sankirtan-bg-dark hover:bg-sankirtan-orange-dark transition-colors rounded-lg text-sm font-semibold"
                       >
                          Submit For Review
                       </button>
                     )}
                     {status === 'rejected' && (
                       <button 
                         onClick={() => setSubmittingCourse(course)}
                         className="w-full py-2 bg-red-900/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors rounded-lg text-sm font-semibold"
                       >
                          Re-submit
                       </button>
                     )}
                     {status === 'pending_review' && (
                       <div className="w-full py-2 border border-sankirtan-border-dark bg-sankirtan-bg-dark rounded-lg text-sm text-center text-sankirtan-muted-dark">
                          Pending Approval
                       </div>
                     )}
                     {status === 'completed' && (
                       <div className="w-full py-2 bg-green-500/10 text-green-500 font-bold border border-green-500/20 rounded-lg text-sm text-center">
                          Approved
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {submittingCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-2xl w-full max-w-md p-6">
             <h3 className="text-xl font-bold mb-4">Submit Course for Review</h3>
             <p className="text-sankirtan-muted-dark text-sm mb-4">Course: <span className="font-bold text-sankirtan-text-dark">{submittingCourse.title}</span></p>
             <textarea 
               value={menteeNotes} 
               onChange={e => setMenteeNotes(e.target.value)}
               placeholder="Add any notes or realizations for your mentor (optional)"
               className="w-full h-32 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl p-3 focus:outline-none focus:border-sankirtan-gold-dark mb-4 resize-none"
             ></textarea>
             <div className="flex gap-3 justify-end">
               <button onClick={() => setSubmittingCourse(null)} className="px-4 py-2 hover:bg-sankirtan-bg-dark rounded-xl transition-colors font-medium">Cancel</button>
               <button onClick={submitCourse} className="px-4 py-2 bg-sankirtan-gold-dark text-sankirtan-bg-dark font-bold rounded-xl transition-colors">Submit</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
