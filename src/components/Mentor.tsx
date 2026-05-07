import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { Plus, List, Clock, CheckCircle2, XCircle, AlertCircle, Save, X, Edit2, Trash2, Users, Calendar, Eye, ArrowLeft, Activity, User as UserIcon, BookOpen } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import BatchDetails from './BatchDetails';

type MentorTab = 'my_batches' | 'new_batch' | 'course_approvals' | 'my_mentees';

interface MentorProps {
  user: User;
}

export default function MentorPanel({ user }: MentorProps) {
  const [activeTab, setActiveTab] = useState<MentorTab>('my_batches');
  const [editingRequest, setEditingRequest] = useState<any>(null);

  return (
    <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md rounded-2xl shadow-xl border border-sankirtan-border-dark overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-sankirtan-border-dark bg-sankirtan-bg-dark/30 p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <List className="w-5 h-5 text-sankirtan-gold-dark" />
          <h2 className="text-lg font-bold text-sankirtan-text-dark">Mentor Panel</h2>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => { setActiveTab('my_batches'); setEditingRequest(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'my_batches' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            My Batches
          </button>
          <button
            onClick={() => { setActiveTab('new_batch'); setEditingRequest(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'new_batch' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Start a New Batch
          </button>
          <button
            onClick={() => { setActiveTab('course_approvals'); setEditingRequest(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'course_approvals' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Course Approvals
          </button>          <button
            onClick={() => { setActiveTab('my_mentees'); setEditingRequest(null); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'my_mentees' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            My Mentees
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6 relative overflow-y-auto">
        {activeTab === 'my_batches' && <MyBatches userId={user.id} onEditRequest={(req) => { setEditingRequest(req); setActiveTab('new_batch'); }} />}
        {activeTab === 'new_batch' && <StartNewBatch userId={user.id} existingRequest={editingRequest} onSuccess={() => { setActiveTab('my_batches'); setEditingRequest(null); }} />}
        {activeTab === 'course_approvals' && <CourseApprovals userId={user.id} />}
        {activeTab === 'my_mentees' && <MyMentees userId={user.id} />}
      </div>
    </div>
  );
}

function StartNewBatch({ userId, existingRequest, onSuccess }: { userId: string, existingRequest?: any, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    batch_name: existingRequest?.batch_name || '',
    proposed_schedule: existingRequest?.proposed_schedule || '',
    expected_mentees: existingRequest?.expected_mentees || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (existingRequest) {
        // Resubmit the existing request
        const { error: updateError } = await supabase.from('batch_approval_requests').update({
          batch_name: formData.batch_name,
          proposed_schedule: formData.proposed_schedule,
          expected_mentees: formData.expected_mentees,
          status: 'pending' // Move back to pending for re-evaluation
        }).eq('id', existingRequest.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('batch_approval_requests').insert({
          mentor_id: userId,
          batch_name: formData.batch_name,
          proposed_schedule: formData.proposed_schedule,
          expected_mentees: formData.expected_mentees,
          status: 'pending'
        });

        if (insertError) throw insertError;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-bold mb-6">{existingRequest ? 'Edit & Resubmit Batch Request' : 'Start a New Batch'}</h3>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-2">Batch Name</label>
          <input
            type="text"
            required
            value={formData.batch_name}
            onChange={e => setFormData({ ...formData, batch_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark transition-all"
            placeholder="e.g. Sunday Morning Bhakti Vriksha"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-2">Timings / Schedule</label>
          <input
            type="text"
            required
            value={formData.proposed_schedule}
            onChange={e => setFormData({ ...formData, proposed_schedule: e.target.value })}
            className="w-full px-4 py-2.5 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark transition-all"
            placeholder="e.g. Sundays 10:00 AM - 12:00 PM"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-2">Expected Number of Mentees</label>
          <input
            type="number"
            min="1"
            required
            value={formData.expected_mentees || ''}
            onChange={e => setFormData({ ...formData, expected_mentees: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-sankirtan-gold-dark text-sankirtan-bg-dark font-bold rounded-xl hover:bg-sankirtan-orange-dark hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

function MyBatches({ userId, onEditRequest }: { userId: string, onEditRequest: (req: any) => void }) {
  const [requests, setRequests] = useState<Database['public']['Tables']['batch_approval_requests']['Row'][]>([]);
  const [activeBatches, setActiveBatches] = useState<Database['public']['Tables']['batches']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBatch, setSelectedBatch] = useState<Database['public']['Tables']['batches']['Row'] | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Database['public']['Tables']['batches']['Row']>>({});

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    
    const [reqsRes, batchesRes] = await Promise.all([
      supabase.from('batch_approval_requests').select('*').eq('mentor_id', userId).order('created_at', { ascending: false }),
      supabase.from('batches').select('*').eq('mentor_id', userId).order('created_at', { ascending: false })
    ]);

    if (reqsRes.data) setRequests(reqsRes.data);
    if (batchesRes.data) setActiveBatches(batchesRes.data);
    
    setLoading(false);
  };

  const updateBatch = async () => {
    if (!editingBatchId || !editForm) return;
    
    await supabase.from('batches').update({
      name: editForm.name,
      schedule: editForm.schedule,
      location: editForm.location,
      status: editForm.status
    }).eq('id', editingBatchId);
    
    setEditingBatchId(null);
    fetchData();
  };

  const deleteBatch = async (id: string) => {
    // Delete memberships first
    await supabase.from('batch_memberships').delete().eq('batch_id', id);
    
    // Delete sessions attendance
    const { data: sessions } = await supabase.from('sessions').select('id').eq('batch_id', id);
    if (sessions && sessions.length > 0) {
       for (const s of sessions) {
          await supabase.from('attendance').delete().eq('session_id', s.id);
       }
       await supabase.from('sessions').delete().eq('batch_id', id);
    }
    
    // Delete batch modules
    await supabase.from('batch_modules').delete().eq('batch_id', id);

    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) {
       console.error("Delete batch error:", error);
       alert("Failed to delete batch. " + error.message);
    }
    
    fetchData();
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  if (selectedBatch) {
    return <BatchDetails batch={selectedBatch} onBack={() => setSelectedBatch(null)} />;
  }

  return (
    <div className="space-y-10">
      {/* Active Batches Section */}
      <section>
        <h3 className="text-xl font-bold mb-4 border-b border-sankirtan-border-dark pb-2">Approved / Active Batches</h3>
        {activeBatches.length === 0 ? (
          <p className="text-sankirtan-muted-dark">No active batches yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-sm">
            {activeBatches.map(batch => (
              <div key={batch.id} className="bg-sankirtan-bg-dark/40 border border-sankirtan-border-dark rounded-xl p-4">
                {editingBatchId === batch.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Batch Name</label>
                        <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Schedule</label>
                        <input type="text" value={editForm.schedule || ''} onChange={e => setEditForm({...editForm, schedule: e.target.value})} className="w-full bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Location</label>
                        <input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Status</label>
                        <select value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-lg px-3 py-2">
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={updateBatch} className="flex items-center px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg"><Save className="w-4 h-4 mr-1" /> Save</button>
                      <button onClick={() => setEditingBatchId(null)} className="flex items-center px-3 py-1.5 bg-sankirtan-bg-dark text-sankirtan-muted-dark hover:text-white rounded-lg"><X className="w-4 h-4 mr-1" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-sankirtan-gold-dark">{batch.name}</h4>
                      <p className="text-sankirtan-text-dark flex items-center gap-2 mt-1"><Clock className="w-4 h-4 text-sankirtan-muted-dark" /> {batch.schedule}</p>
                      {batch.location && <p className="text-sankirtan-muted-dark mt-1 text-xs">Loc: {batch.location}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        batch.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        batch.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {batch.status.toUpperCase()}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedBatch(batch)} className="flex items-center px-3 py-1 bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/20 rounded-lg transition-colors font-medium text-xs"><Eye className="w-3.5 h-3.5 mr-1" /> View Details</button>
                        <button onClick={() => { setEditingBatchId(batch.id); setEditForm(batch); }} className="p-2 text-sankirtan-muted-dark hover:text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={async() => { if(window.confirm('Delete this batch?')) deleteBatch(batch.id); }} className="p-2 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4 border-b border-sankirtan-border-dark pb-2">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-sankirtan-gold-dark/5 border border-sankirtan-gold-dark/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sankirtan-text-dark">{req.batch_name}</h4>
                  <p className="text-sm text-sankirtan-muted-dark flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5" /> {req.proposed_schedule}</p>
                </div>
                <div className="flex items-center gap-2 text-sankirtan-gold-dark px-3 py-1 bg-sankirtan-gold-dark/10 rounded-lg text-sm font-semibold">
                  <AlertCircle className="w-4 h-4" /> Pending Admin Approval
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Requests Section */}
      {pastRequests.length > 0 && (
        <section>
          <h3 className="text-lg font-bold mb-4 text-sankirtan-muted-dark">Past Requests</h3>
          <div className="space-y-3 opacity-70">
            {pastRequests.map(req => (
              <div key={req.id} className={`border rounded-xl p-4 flex justify-between items-start ${
                req.status === 'approved' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div>
                  <h4 className="font-semibold">{req.batch_name}</h4>
                  <p className="text-sm flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5" /> {req.proposed_schedule}</p>
                  {req.admin_note && (
                    <p className="text-xs mt-2 italic bg-sankirtan-bg-dark/50 p-2 rounded border border-sankirtan-border-dark">
                      Admin note: {req.admin_note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                    req.status === 'approved' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {req.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="capitalize">{req.status}</span>
                  </div>
                  {req.status === 'rejected' && (
                    <button
                      onClick={() => onEditRequest(req)}
                      className="px-3 py-1.5 bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/20 text-xs font-semibold rounded-lg transition-colors flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit & Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


function CourseApprovals({ userId }: { userId: string }) {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, [userId]);

  const fetchPending = async () => {
    setLoading(true);
    const { data: batches } = await supabase.from('batches').select('id').eq('mentor_id', userId);
    const batchIds = (batches || []).map(b => b.id);
    
    if (batchIds.length === 0) {
      setPending([]);
      setLoading(false);
      return;
    }
    
    const { data: memberships } = await supabase.from('batch_memberships').select('mentee_id').in('batch_id', batchIds).is('left_at', null);
    const menteeIds = (memberships || []).map(m => m.mentee_id);
    
    if (menteeIds.length === 0) {
      setPending([]);
      setLoading(false);
      return;
    }

    const { data: completions } = await supabase
       .from('course_completions')
       .select('*, courses(title), users!course_completions_user_id_fkey(full_name, initiated_name, email)')
       .in('user_id', menteeIds)
       .eq('status', 'pending_review')
       .order('submitted_at', { ascending: false });
       
    setPending(completions || []);
    setLoading(false);
  };

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id);
    await supabase.from('course_completions').update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId
    }).eq('id', id);
    
    await fetchPending();
    setActionLoading(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-6 h-6 text-sankirtan-gold-dark" />
        Pending Course Approvals
      </h3>

      {pending.length === 0 ? (
        <div className="text-center py-12 bg-sankirtan-panel-dark/50 backdrop-blur-md rounded-xl border border-sankirtan-border-dark border-dashed">
          <CheckCircle2 className="w-12 h-12 text-sankirtan-gold-dark/50 mx-auto mb-3" />
          <p className="text-sankirtan-muted-dark">No pending course completions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map(item => (
            <div key={item.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark p-5 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{item.courses?.title || item.other_course_title}</h4>
                  <p className="text-sm text-sankirtan-muted-dark flex items-center gap-2 mt-1">
                     <Users className="w-4 h-4" />
                     Mentee: <span className="font-semibold text-sankirtan-text-dark">{item.users?.initiated_name || item.users?.full_name || item.users?.email}</span>
                  </p>
                  <p className="text-xs text-sankirtan-muted-dark mt-1 flex items-center gap-1">
                     <Calendar className="w-3 h-3"/> Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {item.mentee_notes && (
                <div className="mb-4 bg-sankirtan-panel-dark/50 backdrop-blur-md rounded-lg p-3 border border-sankirtan-border-dark/50 text-sm">
                   <p className="text-xs text-sankirtan-muted-dark mb-1 uppercase tracking-wider font-semibold">Mentee Notes</p>
                   <p className="italic">"{item.mentee_notes}"</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => handleAction(item.id, 'completed')}
                  disabled={actionLoading === item.id}
                  className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/30 transition-colors py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === item.id ? <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" /> : 'Approve'}
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'rejected')}
                  disabled={actionLoading === item.id}
                  className="flex-1 bg-red-900/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 transition-colors py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === item.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function MyMentees({ userId }: { userId: string }) {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);
  
  const [logsList, setLogsList] = useState<any>({});
  const [menteeBooks, setMenteeBooks] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchMentees();
  }, [userId]);

  const fetchMentees = async () => {
    setLoading(true);
    // 1. Get all batches for this mentor
    const { data: batches } = await supabase.from('batches').select('id, name').eq('mentor_id', userId);
    
    if (!batches || batches.length === 0) {
      setLoading(false);
      return;
    }
    
    const batchIds = batches.map(b => b.id);
    
    // 2. Get all distinct active memberships
    const { data: memberships } = await supabase.from('batch_memberships')
      .select('mentee_id, batch_id')
      .in('batch_id', batchIds)
      .is('left_at', null);
      
    if (!memberships || memberships.length === 0) {
      setLoading(false);
      return;
    }
    
    const menteeIds = [...new Set(memberships.map(m => m.mentee_id))];
    
    // 3. Get user details
    const { data: users } = await supabase.from('users')
      .select('id, full_name, email')
      .in('id', menteeIds)
      .order('full_name');
      
    if (users) {
      // Annotate users with their batches
      const annotatedMentees = users.map(u => {
        const userBatchIds = memberships.filter(m => m.mentee_id === u.id).map(m => m.batch_id);
        const userBatches = batches.filter(b => userBatchIds.includes(b.id));
        return { ...u, batches: userBatches };
      });
      setMentees(annotatedMentees);
    }
    setLoading(false);
  };
  
  const handleSelectMentee = async (mentee: any) => {
    setSelectedMentee(mentee);
    setLoadingDetails(true);
    
    // Fetch last 5 sadhana logs
    const { data: sadhana } = await supabase.from('sadhana_logs')
       .select('*, sadhana_book_readings(*, prabhupada_books(title))')
       .eq('user_id', mentee.id)
       .order('date', { ascending: false })
       .limit(5);
       
    // Fetch last 5 service logs
    const { data: service } = await supabase.from('service_logs')
       .select('*, departments(name)')
       .eq('user_id', mentee.id)
       .order('date', { ascending: false })
       .limit(5);
       
    // Fetch mentee books
    const { data: books } = await supabase.from('mentee_books')
       .select('*, prabhupada_books(title)')
       .eq('user_id', mentee.id)
       .order('status', { ascending: false });
       
    setMenteeBooks(books || []);
    setLogsList({ sadhana: sadhana || [], service: service || [] });
    setLoadingDetails(false);
  };

  if (selectedMentee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-sankirtan-border-dark pb-4">
          <button onClick={() => setSelectedMentee(null)} className="p-2 hover:bg-sankirtan-panel-dark rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-sankirtan-muted-dark" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-sankirtan-gold-dark/20 text-sankirtan-gold-dark rounded-full flex items-center justify-center font-bold text-xl">
               {selectedMentee.full_name?.charAt(0) || 'U'}
             </div>
             <div>
               <h3 className="text-xl font-bold">{selectedMentee.full_name}</h3>
               <p className="text-sm text-sankirtan-muted-dark">{selectedMentee.email}</p>
             </div>
          </div>
        </div>
        
        {loadingDetails ? (
           <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark rounded-2xl p-5">
                 <h4 className="font-bold flex items-center gap-2 mb-4 text-lg"><Activity className="w-5 h-5 text-sankirtan-gold-dark" /> Recent Sadhana</h4>
                 {logsList.sadhana?.length === 0 ? (
                    <p className="text-sm text-sankirtan-muted-dark italic">No sadhana logs recorded recently.</p>
                 ) : (
                    <div className="space-y-3">
                      {logsList.sadhana.map((log: any) => (
                        <div key={log.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark p-3 rounded-xl flex flex-col gap-2">
                           <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-sankirtan-gold-dark">{new Date(log.date).toLocaleDateString()}</span>
                              <span className="text-xs bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark px-2 py-1 rounded-full">{log.score}% Score</span>
                           </div>
                           <div className="text-sm grid grid-cols-2 gap-1 text-sankirtan-text-dark/80">
                             <div><span className="text-sankirtan-muted-dark mr-1">Rounds:</span>{log.rounds}</div>
                             <div><span className="text-sankirtan-muted-dark mr-1">Mood:</span>{log.mood}</div>
                           </div>
                           
                           {log.sadhana_book_readings && log.sadhana_book_readings.length > 0 && (
                             <div className="mt-1 pt-2 border-t border-sankirtan-border-dark/50">
                               <p className="text-xs text-sankirtan-muted-dark mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Reading</p>
                               {log.sadhana_book_readings.map((r: any) => (
                                  <div key={r.id} className="text-xs text-sankirtan-text-dark/90 flex justify-between">
                                    <span className="truncate max-w-[200px]" title={r.prabhupada_books?.title || r.other_book_title}>{r.prabhupada_books?.title || r.other_book_title}</span>
                                    <span className="text-sankirtan-muted-dark">{r.duration_minutes} min</span>
                                  </div>
                               ))}
                             </div>
                           )}
                           
                           {log.notes && (
                             <p className="text-xs italic text-sankirtan-muted-dark mt-1">"{log.notes}"</p>
                           )}
                        </div>
                      ))}
                    </div>
                 )}
              </div>
              
              <div className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark rounded-2xl p-5">
                 <h4 className="font-bold flex items-center gap-2 mb-4 text-lg"><Plus className="w-5 h-5 text-sankirtan-gold-dark" /> Recent Service</h4>
                 {logsList.service?.length === 0 ? (
                    <p className="text-sm text-sankirtan-muted-dark italic">No service logs recorded recently.</p>
                 ) : (
                    <div className="space-y-3">
                      {logsList.service.map((log: any) => (
                        <div key={log.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark p-3 rounded-xl">
                           <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm text-sankirtan-gold-dark">{new Date(log.date).toLocaleDateString()}</span>
                              <span className="text-xs bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark px-2 py-1 rounded-full">{log.hours} hours</span>
                           </div>
                           <p className="text-sm font-medium mb-1">{log.departments?.name}</p>
                           {log.notes && (
                             <p className="text-xs text-sankirtan-muted-dark">"{log.notes}"</p>
                           )}
                        </div>
                      ))}
                    </div>
                 )}
              </div>
              
              <div className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark rounded-2xl p-5 lg:col-span-2">
                 <h4 className="font-bold flex items-center gap-2 mb-4 text-lg"><BookOpen className="w-5 h-5 text-sankirtan-gold-dark" /> Books Reading & Completed</h4>
                 {menteeBooks.length === 0 ? (
                    <p className="text-sm text-sankirtan-muted-dark italic">No books listed.</p>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {menteeBooks.map((mb: any) => (
                        <div key={mb.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark p-3 rounded-xl flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${mb.status === 'completed' ? 'bg-sankirtan-green-dark/10 border-sankirtan-green-dark/30 text-sankirtan-green-dark' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                              <BookOpen className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="font-bold text-sm line-clamp-2">{mb.prabhupada_books?.title}</p>
                              <p className="text-xs text-sankirtan-muted-dark capitalize">{mb.status.replace('_', ' ')}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 )}
              </div>

           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold flex items-center gap-2">
           <UserIcon className="w-5 h-5 text-sankirtan-gold-dark" />
           My Mentees
        </h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
      ) : mentees.length === 0 ? (
        <div className="text-center py-12 bg-sankirtan-panel-dark/30 rounded-2xl border border-sankirtan-border-dark">
          <Users className="w-12 h-12 text-sankirtan-muted-dark/50 mx-auto mb-3" />
          <p className="text-sankirtan-muted-dark font-medium">You don't have any active mentees yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {mentees.map(mentee => (
            <div 
              key={mentee.id} 
              onClick={() => handleSelectMentee(mentee)}
              className="bg-sankirtan-bg-dark border border-sankirtan-border-dark hover:border-sankirtan-gold-dark/50 hover:bg-sankirtan-panel-dark rounded-xl p-4 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
            >
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-sankirtan-panel-dark rounded-full flex items-center justify-center border border-sankirtan-border-dark group-hover:border-sankirtan-gold-dark/30 transition-colors">
                   <UserIcon className="w-5 h-5 text-sankirtan-gold-dark" />
                 </div>
                 <div>
                   <h4 className="font-bold text-[15px] group-hover:text-sankirtan-gold-dark transition-colors">{mentee.full_name}</h4>
                   <div className="flex gap-1 mt-1 flex-wrap">
                     {mentee.batches.map((b: any) => (
                        <span key={b.id} className="text-[10px] bg-sankirtan-muted-dark/20 px-1.5 py-0.5 rounded text-sankirtan-muted-dark border border-sankirtan-border-dark">{b.name}</span>
                     ))}
                   </div>
                 </div>
               </div>
               <div className="text-sankirtan-muted-dark opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <Eye className="w-5 h-5" />
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
