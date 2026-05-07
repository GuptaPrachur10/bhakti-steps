import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Users, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import SessionDetails from './SessionDetails';

export default function BatchDetails({ batch, onBack }: { batch: any, onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'sessions' | 'modules'>('members');
  const [modules, setModules] = useState<any[]>([]);
  const [batchModules, setBatchModules] = useState<any[]>([]);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableMentees, setAvailableMentees] = useState<any[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Create mentee state
  
  const [newMentee, setNewMentee] = useState({ name: '', email: '' });
  const [creatingMentee, setCreatingMentee] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, [batch.id]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch members
    const { data: membersData } = await supabase
      .from('batch_memberships')
      .select('*, mentee:users!batch_memberships_mentee_id_fkey(id, full_name, email)')
      .eq('batch_id', batch.id);
      
    if (membersData) setMembers(membersData);

    // Fetch sessions
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('batch_id', batch.id)
      .order('session_date', { ascending: false });

    if (sessionsData) setSessions(sessionsData);
    
    // Fetch available mentees (users with role=mentee not already in members)
    const currentMemberIds = membersData ? membersData.map(m => m.mentee_id) : [];
    
    const { data: menteesData } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'mentee');
      
    if (menteesData) {
      setAvailableMentees(menteesData.filter(m => !currentMemberIds.includes(m.id)));
    }

    setLoading(false);
  };

  const handleCreateMentee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMentee(true);
    setCreateError(null);
    
    try {
      // Create a temporary client with no persisted session to avoid logging out the mentor
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      );
      
      const { data, error: signUpError } = await tempClient.auth.signUp({
        email: newMentee.email,
        password: '123456',
        options: {
           data: {
              full_name: newMentee.name
           }
        }
      });
      
      if (signUpError) throw signUpError;
      const newUserId = data.user?.id;
      if (!newUserId) throw new Error("Failed to get user ID after sign up");
      
      // Insert into public.users
      const { error: insertError } = await supabase.from('users').insert({
        id: newUserId,
        email: newMentee.email,
        full_name: newMentee.name,
        
        role: 'mentee'
      });
      if (insertError) throw insertError;
      
      // Auto assign to this batch
      await addMember(newUserId);
      
      // Reset
      setNewMentee({ name: '', email: '' });
      setShowAddMember(false);
      
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || 'Error creating mentee');
    } finally {
      setCreatingMentee(false);
    }
  };

  const addMember = async (menteeId: string) => {
    await supabase.from('batch_memberships').insert({
      batch_id: batch.id,
      mentee_id: menteeId
    });
    fetchData();
    setShowAddMember(false);
  };

  const removeMember = async (membershipId: string) => {
    if (window.confirm("Remove this mentee from the batch?")) {
      const { error } = await supabase.from('batch_memberships').delete().eq('id', membershipId);
      if (error) {
         console.error("Error removing member:", error);
         alert("Failed to remove member. " + error.message);
      } else {
         fetchData();
      }
    }
  };

  const createSession = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('sessions').insert({
      batch_id: batch.id,
      session_date: today
    }).select().single();
    
    if (data) {
      setSessions([data, ...sessions]);
      // Auto-create attendance records for all current members
      if (members.length > 0) {
        const attendanceRecords = members.map(m => ({
          session_id: data.id,
          mentee_id: m.mentee_id,
          status: 'present' // default
        }));
        await supabase.from('attendance').insert(attendanceRecords);
      }
      
      fetchData();
      setSelectedSessionId(data.id);
    }
  };

  if (selectedSessionId) {
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>;
    return <SessionDetails session={session} members={members} onBack={() => { setSelectedSessionId(null); fetchData(); }} />;
  }

  const updateBatchModule = async (moduleId: string, status: string) => {
    const existing = batchModules.find(bm => bm.module_id === moduleId);
    if (existing) {
       await supabase.from('batch_modules').update({ status }).eq('id', existing.id);
    } else {
       await supabase.from('batch_modules').insert({
          batch_id: batch.id,
          module_id: moduleId,
          status,
          started_at: new Date().toISOString()
       });
    }
    
    // refresh BM
    const { data: bmData } = await supabase.from('batch_modules').select('*').eq('batch_id', batch.id);
    if (bmData) setBatchModules(bmData);
  };  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-sankirtan-border-dark pb-4">
        <button onClick={onBack} className="p-2 hover:bg-sankirtan-bg-dark rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-sankirtan-muted-dark" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-sankirtan-gold-dark">{batch.name}</h2>
          <p className="text-sm text-sankirtan-muted-dark">{batch.schedule} • {batch.location}</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-sankirtan-bg-dark/50 rounded-lg w-fit border border-sankirtan-border-dark">
        <button 
          onClick={() => setActiveTab('members')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'members' ? 'bg-sankirtan-panel-dark text-sankirtan-gold-dark shadow' : 'text-sankirtan-muted-dark'}`}
        >
          <Users className="w-4 h-4 mr-2" /> Members ({members.length})
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'sessions' ? 'bg-sankirtan-panel-dark text-sankirtan-gold-dark shadow' : 'text-sankirtan-muted-dark'}`}
        >
          <Calendar className="w-4 h-4 mr-2" /> Sessions ({sessions.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
      ) : activeTab === 'members' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Enrolled Mentees</h3>
            <button onClick={() => setShowAddMember(!showAddMember)} className="flex items-center px-3 py-1.5 bg-sankirtan-gold-dark text-sankirtan-bg-dark text-sm font-semibold rounded-lg hover:bg-sankirtan-orange-dark transition-colors">
              {showAddMember ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add Mentee</>}
            </button>
          </div>
          
          {showAddMember && (
            <div className="bg-sankirtan-panel-dark p-4 rounded-xl border border-sankirtan-border-dark flex flex-col gap-4">
                 <form onSubmit={handleCreateMentee} className="space-y-3">
                   <h4 className="font-semibold text-sm mb-2 text-sankirtan-text-dark">Create New Mentee</h4>
                   {createError && <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded">{createError}</div>}
                   <div>
                     <input type="text" placeholder="Full Name" required value={newMentee.name} onChange={e => setNewMentee({...newMentee, name: e.target.value})} className="w-full text-sm bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-3 py-2" />
                   </div>
                   <div>
                     <input type="email" placeholder="Email Address" required value={newMentee.email} onChange={e => setNewMentee({...newMentee, email: e.target.value})} className="w-full text-sm bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-3 py-2" />
                   </div>
                   <p className="text-xs text-sankirtan-muted-dark">Default password will be set to: <strong>123456</strong></p>
                   <button type="submit" disabled={creatingMentee} className="w-full py-2 bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-lg font-bold text-sm hover:bg-sankirtan-orange-dark">
                     {creatingMentee ? 'Creating...' : 'Create & Invite Mentee'}
                   </button>
                 </form>
            </div>
          )}

          {members.length === 0 ? (
            <p className="text-sankirtan-muted-dark text-center py-10">No mentees enrolled in this batch yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(member => (
                <div key={member.id} className="bg-sankirtan-panel-dark border border-sankirtan-border-dark p-4 rounded-xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold">{member.mentee?.full_name || 'Unknown User'}</h4>
                    <p className="text-xs text-sankirtan-muted-dark">{member.mentee?.email}</p>
                  </div>
                  <button onClick={() => removeMember(member.id)} className="p-2 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Training Sessions</h3>
            <button onClick={createSession} className="flex items-center px-3 py-1.5 bg-sankirtan-gold-dark text-sankirtan-bg-dark text-sm font-semibold rounded-lg hover:bg-sankirtan-orange-dark transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Log New Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-sankirtan-muted-dark text-center py-10">No sessions logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sessions.map(session => (
                <div key={session.id} className="bg-sankirtan-panel-dark border border-sankirtan-border-dark p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-sankirtan-gold-dark" /> {new Date(session.session_date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setSelectedSessionId(session.id)} className="px-4 py-1.5 bg-sankirtan-bg-dark hover:bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-medium border border-sankirtan-border-dark rounded-lg text-sm transition-colors">
                    Manage Attendance
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
