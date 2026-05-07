import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Check, X as XIcon } from 'lucide-react';

export default function SessionDetails({ session, members, onBack }: { session: any, members: any[], onBack: () => void }) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [session.id]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', session.id);
      
    if (data) setAttendance(data);
    setLoading(false);
  };

  const updateAttendance = async (menteeId: string, status: string) => {
    const existing = attendance.find(a => a.mentee_id === menteeId);
    
    if (existing) {
      await supabase.from('attendance').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert({
        session_id: session.id,
        mentee_id: menteeId,
        status
      });
    }
    fetchAttendance();
  };

  const deleteSession = async () => {
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      // Delete attendance records first to avoid foreign key constraints
      await supabase.from('attendance').delete().eq('session_id', session.id);
      
      const { error } = await supabase.from('sessions').delete().eq('id', session.id);
      if (error) {
         console.error("Error deleting session:", error);
         alert("Failed to delete session. " + error.message);
      } else {
         onBack();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-sankirtan-border-dark pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-sankirtan-bg-dark rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-sankirtan-muted-dark" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-sankirtan-gold-dark">Session Attendance</h2>
            <p className="text-sm text-sankirtan-muted-dark">{new Date(session.session_date).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={deleteSession} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/30 rounded-lg hover:bg-red-500/10">
          Delete Session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-sankirtan-muted-dark mb-4">Mark attendance for each mentee enrolled in this batch.</p>
          <div className="grid grid-cols-1 gap-3">
            {members.map(member => {
              const menteeId = member.mentee_id;
              const menteeAtt = attendance.find(a => a.mentee_id === menteeId);
              const status = menteeAtt ? menteeAtt.status : 'unknown';

              return (
                <div key={member.id} className="bg-sankirtan-panel-dark border border-sankirtan-border-dark p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold">{member.mentee?.full_name || 'Unknown User'}</h4>
                    <p className="text-xs text-sankirtan-muted-dark">{member.mentee?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateAttendance(menteeId, 'present')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        status === 'present' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-sankirtan-bg-dark text-sankirtan-muted-dark border border-sankirtan-border-dark hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30'
                      }`}
                    >
                      <Check className="w-4 h-4" /> Present
                    </button>
                    <button 
                      onClick={() => updateAttendance(menteeId, 'absent')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        status === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-sankirtan-bg-dark text-sankirtan-muted-dark border border-sankirtan-border-dark hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
                      }`}
                    >
                      <XIcon className="w-4 h-4" /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {members.length === 0 && (
            <p className="text-center text-sankirtan-muted-dark py-10">No mentees in this batch to take attendance for.</p>
          )}
        </div>
      )}
    </div>
  );
}
