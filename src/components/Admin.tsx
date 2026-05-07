import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { Edit2, Save, X, Plus, Trash2, Shield, AlertCircle, Users, Activity, List, Calendar, ArrowLeft, BookText, CheckCircle2 } from 'lucide-react';

type AdminTab = 'overview' | 'departments' | 'spiritual_masters' | 'books' | 'batch_approvals' | 'courses' | 'mentors' | 'batches' | 'mentees' | 'modules';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="bg-sankirtan-panel-dark rounded-2xl shadow-xl border border-sankirtan-border-dark overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-sankirtan-border-dark bg-sankirtan-bg-dark/30 p-4 shrink-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="w-5 h-5 text-sankirtan-gold-dark" />
          <h2 className="text-lg font-bold text-sankirtan-text-dark">Admin Panel</h2>
        </div>
        
        <nav className="space-y-2 flex flex-row overflow-x-auto md:flex-col pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'overview' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('batch_approvals')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'batch_approvals' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Batch Approvals
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'departments' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Service Departments
          </button>
          <button
            onClick={() => setActiveTab('spiritual_masters')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'spiritual_masters' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Spiritual Masters
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'books' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Prabhupada Books
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'courses' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'modules' 
                ? 'bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark font-semibold border border-sankirtan-gold-dark/30' 
                : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark border border-transparent'
            }`}
          >
            Modules
          </button>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-6 relative overflow-y-auto w-full min-w-0">
        {activeTab === 'overview' && <OverviewManager setActiveTab={setActiveTab} />}
        {activeTab === 'mentors' && <MentorsManager />}
        {activeTab === 'batches' && <BatchesManager />}
        {activeTab === 'mentees' && <MenteesManager />}        {activeTab === 'modules' && <ModulesManager />}        {activeTab === 'batch_approvals' && <BatchApprovalsManager />}
        {activeTab === 'courses' && <CoursesManager />}
        {activeTab === 'departments' && <DepartmentsManager />}
        {activeTab === 'spiritual_masters' && <SpiritualMastersManager />}
        {activeTab === 'books' && <BooksManager />}
      </div>
    </div>
  );
}

function BatchApprovalsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

      const [rejectingId, setRejectingId] = useState<string | null>(null);
      const [rejectNote, setRejectNote] = useState("");
      const [errorMsg, setErrorMsg] = useState<string | null>(null);
      
      useEffect(() => {
        fetchRequests();
      }, []);

  const fetchRequests = async () => {
    setLoading(true);
    // Fetch requests along with mentor details (user full name)
    const { data } = await supabase
      .from('batch_approval_requests')
      .select(`
        *,
        mentor:users!mentor_id(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleApprove = async (request: any) => {
    try {
      // 1. Create the batch
      const { error: batchError } = await supabase.from('batches').insert({
        mentor_id: request.mentor_id,
        name: request.batch_name,
        schedule: request.proposed_schedule,
        location: 'Online / TBD',
        status: 'active'
      });
      if (batchError) throw batchError;

      // 2. Update the request status
      const { data: updateData, error: reqError } = await supabase.from('batch_approval_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select();
        
      if (reqError) throw reqError;
      
      if (!updateData || updateData.length === 0) {
         // This means the row was not updated due to RLS! 
         // We'll throw a helpful error!
         const rlsError = new Error("Database Row-Level Security (RLS) policies prevent admins from updating the request status. The batch was created in 'My Batches', but this request cannot be marked as approved. Please adjust RLS policies on 'batch_approval_requests' table to allow updates by admins.");
         throw rlsError;
      }

      fetchRequests();
    } catch (err: any) {
      console.error('Failed to approve batch', err);
      setErrorMsg(`Failed to approve batch: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (request: any) => {
    if (!rejectNote) {
      setErrorMsg("Please provide a reason for rejection.");
      return;
    }

    try {
      const { data: updateData, error: reqError } = await supabase.from('batch_approval_requests')
        .update({
          status: 'rejected',
          admin_note: rejectNote,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select();

      if (reqError) throw reqError;
      
      if (!updateData || updateData.length === 0) {
         throw new Error("Database Row-Level Security (RLS) policies prevent admins from updating the request. Please adjust RLS policies on 'batch_approval_requests' table.");
      }

      setRejectingId(null);
      setRejectNote("");
      fetchRequests();
    } catch (err: any) {
      console.error('Failed to reject batch', err);
      setErrorMsg(`Failed to reject batch: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold">Pending Batch Requests</h3>
      </div>
      
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4 hover:text-white transition-colors" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center text-sankirtan-muted-dark bg-sankirtan-bg-dark/30 rounded-xl border border-sankirtan-border-dark">
          No pending batch requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-sankirtan-panel-dark border border-sankirtan-border-dark p-5 rounded-xl shadow-lg flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-lg text-sankirtan-text-dark">{req.batch_name}</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-sankirtan-muted-dark"><span className="font-semibold">Mentor:</span> {req.mentor?.full_name || req.mentor?.email || 'Unknown User'}</p>
                    <p className="text-sm text-sankirtan-muted-dark"><span className="font-semibold">Schedule:</span> {req.proposed_schedule}</p>
                    <p className="text-sm text-sankirtan-muted-dark"><span className="font-semibold">Expected Mentees:</span> {req.expected_mentees}</p>
                    <p className="text-xs text-sankirtan-muted-dark/70">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 h-fit">
                  <button 
                    onClick={() => { setRejectingId(rejectingId === req.id ? null : req.id); setRejectNote(""); }}
                    className="px-4 py-2 border border-red-500/50 text-red-400 bg-red-900/20 hover:bg-red-500/30 rounded-xl transition-all text-sm font-semibold flex-1 md:flex-none"
                  >
                    {rejectingId === req.id ? 'Cancel' : 'Reject'}
                  </button>
                  <button 
                    onClick={() => handleApprove(req)}
                    className="px-4 py-2 bg-sankirtan-green-dark/20 text-green-400 border border-sankirtan-green-dark/40 hover:bg-green-500/30 rounded-xl transition-all text-sm font-semibold shadow flex-1 md:flex-none"
                  >
                    Approve
                  </button>
                </div>
              </div>
              
              {rejectingId === req.id && (
                <div className="flex gap-2 pt-4 border-t border-sankirtan-border-dark mt-2 animate-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Provide a reason for rejection..." 
                    className="flex-1 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl px-4 py-2 text-sm text-sankirtan-text-dark focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                  />
                  <button 
                    onClick={() => handleReject(req)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentsManager() {
  const [items, setItems] = useState<Database['public']['Tables']['departments']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Database['public']['Tables']['departments']['Row']>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('departments').select('*').order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  const saveItem = async () => {
    if (editingId === 'new') {
      await supabase.from('departments').insert({
        name: editForm.name || '',
        active: editForm.active ?? true
      });
    } else if (editingId) {
      await supabase.from('departments').update({
        name: editForm.name,
        active: editForm.active
      }).eq('id', editingId);
    }
    setEditingId(null);
    setIsCreating(false);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold">Service Departments</h3>
        <button
          onClick={() => { setEditingId('new'); setEditForm({ name: '', active: true }); setIsCreating(true); }}
          className="flex items-center px-3 py-1.5 text-sm font-semibold bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-lg hover:bg-sankirtan-orange-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[600px] lg:min-w-0 space-y-4 pb-4">
            {(items.length > 0 || isCreating) && (
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark">
              <div className="col-span-7">Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            )}
            
            {!isCreating && items.length === 0 && (
              <p className="text-sankirtan-muted-dark text-center py-10">No departments yet.</p>
            )}
          
          {isCreating && (
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-sankirtan-bg-dark/50 rounded-xl border border-sankirtan-gold-dark/30">
              <div className="col-span-7">
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" placeholder="Department Name" />
              </div>
              <div className="col-span-2">
                <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-sankirtan-bg-dark/20 rounded-xl border border-sankirtan-border-dark hover:bg-sankirtan-bg-dark/40 transition-colors">
              {editingId === item.id ? (
                <>
                  <div className="col-span-7">
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-7 font-medium">{item.name}</div>
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-sankirtan-green-dark/20 text-sankirtan-green-dark border border-sankirtan-green-dark/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-1.5 text-sankirtan-muted-dark hover:text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        const { error } = await supabase.from('departments').delete().eq('id', item.id); if(error) { alert('Failed to delete: it is being referenced in service logs.'); }
                        fetchItems();
                    }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpiritualMastersManager() {
  const [items, setItems] = useState<Database['public']['Tables']['spiritual_masters']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Database['public']['Tables']['spiritual_masters']['Row']>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('spiritual_masters').select('*').order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  const saveItem = async () => {
    if (editingId === 'new') {
      await supabase.from('spiritual_masters').insert({
        name: editForm.name || '',
        active: editForm.active ?? true
      });
    } else if (editingId) {
      await supabase.from('spiritual_masters').update({
        name: editForm.name,
        active: editForm.active
      }).eq('id', editingId);
    }
    setEditingId(null);
    setIsCreating(false);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold">Spiritual Masters</h3>
        <button
          onClick={() => { setEditingId('new'); setEditForm({ name: '', active: true }); setIsCreating(true); }}
          className="flex items-center px-3 py-1.5 text-sm font-semibold bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-lg hover:bg-sankirtan-orange-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Master
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[500px] lg:min-w-0 space-y-4 pb-4">
            
            {(items.length > 0 || isCreating) && (
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark">
              <div className="col-span-7">Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            )}
            
            {!isCreating && items.length === 0 && (
              <p className="text-sankirtan-muted-dark text-center py-10">No spiritual masters yet.</p>
            )}
          
          {isCreating && (
            <div className="grid grid-cols-12 gap-4 items-center p-4 bg-sankirtan-bg-dark/50 rounded-xl border border-sankirtan-gold-dark/30">
              <div className="col-span-7">
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" placeholder="Master's Name" />
              </div>
              <div className="col-span-2">
                <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-sankirtan-bg-dark/20 rounded-xl border border-sankirtan-border-dark hover:bg-sankirtan-bg-dark/40 transition-colors">
              {editingId === item.id ? (
                <>
                  <div className="col-span-7">
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-7 font-medium">{item.name}</div>
                  <div className="col-span-2 flex items-center">
                     <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-sankirtan-green-dark/20 text-sankirtan-green-dark border border-sankirtan-green-dark/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-1.5 text-sankirtan-muted-dark hover:text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        const { error } = await supabase.from('spiritual_masters').delete().eq('id', item.id); if (error) alert('Failed: being referenced by users.');
                        fetchItems();
                    }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}


function BooksManager() {
  const [items, setItems] = useState<Database['public']['Tables']['prabhupada_books']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Database['public']['Tables']['prabhupada_books']['Row']>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('prabhupada_books').select('*').order('title');
    if (data) setItems(data);
    setLoading(false);
  };

  const saveItem = async () => {
    if (editingId === 'new') {
      await supabase.from('prabhupada_books').insert({
        title: editForm.title || '',
        active: editForm.active ?? true
      });
    } else if (editingId) {
      await supabase.from('prabhupada_books').update({
        title: editForm.title,
        active: editForm.active
      }).eq('id', editingId);
    }
    setEditingId(null);
    setIsCreating(false);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold">Prabhupada Books</h3>
        <button
          onClick={() => { setEditingId('new'); setEditForm({ title: '', active: true }); setIsCreating(true); }}
          className="flex items-center px-3 py-1.5 text-sm font-semibold bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-lg hover:bg-sankirtan-orange-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Book
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[600px] lg:min-w-0 space-y-4 pb-4">
            {(items.length > 0 || isCreating) && (
            <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark">
              <div className="col-span-7 md:col-span-8">Title</div>
              <div className="col-span-2 md:col-span-2">Status</div>
              <div className="col-span-3 md:col-span-2 text-right">Actions</div>
            </div>
            )}
            
            {!isCreating && items.length === 0 && (
              <p className="text-sankirtan-muted-dark text-center py-10">No books yet.</p>
            )}
          
          {isCreating && (
            <div className="grid grid-cols-12 gap-2 md:gap-4 items-center p-4 bg-sankirtan-bg-dark/50 rounded-xl border border-sankirtan-gold-dark/30">
              <div className="col-span-12 md:col-span-8">
                <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm mb-2 md:mb-0" placeholder="Book Title" />
              </div>
              <div className="col-span-6 md:col-span-2">
                <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 md:gap-4 items-center p-4 bg-sankirtan-bg-dark/20 rounded-xl border border-sankirtan-border-dark hover:bg-sankirtan-bg-dark/40 transition-colors">
              {editingId === item.id ? (
                <>
                  <div className="col-span-12 md:col-span-8">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm mb-2 md:mb-0" />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                    <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-7 md:col-span-8 font-medium">{item.title}</div>
                  <div className="col-span-2 md:col-span-2 flex items-center">
                     <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-sankirtan-green-dark/20 text-sankirtan-green-dark border border-sankirtan-green-dark/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-2 flex justify-end gap-2">
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-1.5 text-sankirtan-muted-dark hover:text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        const { error } = await supabase.from('prabhupada_books').delete().eq('id', item.id); if (error) { alert('Failed: This book is being tracked by mentees.'); }
                        fetchItems();
                    }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}


function CoursesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('course_categories').select('*').order('name');
    if (catData) setCategories(catData);
    
    // Auto-create a default category if none exists (required for course creation)
    if (!catData || catData.length === 0) {
        const { data: newCat } = await supabase.from('course_categories').insert({ name: 'General', active: true, sort_order: 1 }).select().single();
        if (newCat) setCategories([newCat]);
    }
    
    const { data } = await supabase.from('courses').select('*, course_categories(name)').order('title');
    if (data) setItems(data);
    setLoading(false);
  };

  const saveItem = async () => {
    const category_id = editForm.category_id || (categories.length > 0 ? categories[0].id : null);
    if (!category_id) return;
    
    if (editingId === 'new') {
      await supabase.from('courses').insert({
        title: editForm.title || '',
        active: editForm.active ?? true,
        category_id
      });
    } else if (editingId) {
      await supabase.from('courses').update({
        title: editForm.title,
        active: editForm.active,
        category_id
      }).eq('id', editingId);
    }
    setEditingId(null);
    setIsCreating(false);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold">Courses</h3>
        <button
          onClick={() => { setEditingId('new'); setEditForm({ title: '', active: true, category_id: categories.length > 0 ? categories[0].id : '' }); setIsCreating(true); }}
          className="flex items-center px-3 py-1.5 text-sm font-semibold bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-lg hover:bg-sankirtan-orange-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[600px] lg:min-w-0 space-y-4 pb-4">
            {(items.length > 0 || isCreating) && (
            <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark">
              <div className="col-span-12 md:col-span-6">Title</div>
              <div className="col-span-12 md:col-span-2">Status</div>
              <div className="col-span-12 md:col-span-4 text-right">Actions</div>
            </div>
            )}
            
            {!isCreating && items.length === 0 && (
              <p className="text-sankirtan-muted-dark text-center py-10">No courses yet.</p>
            )}
          
          {isCreating && (
            <div className="grid grid-cols-12 gap-2 md:gap-4 items-center p-4 bg-sankirtan-bg-dark/50 rounded-xl border border-sankirtan-gold-dark/30">
              <div className="col-span-12 md:col-span-6">
                <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm mb-2 md:mb-0" placeholder="Course Title" />
              </div>
              <div className="col-span-6 md:col-span-2">
                <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="col-span-6 md:col-span-4 flex justify-end gap-2">
                <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 md:gap-4 items-center p-4 bg-sankirtan-bg-dark/20 rounded-xl border border-sankirtan-border-dark hover:bg-sankirtan-bg-dark/40 transition-colors">
              {editingId === item.id ? (
                <>
                  <div className="col-span-12 md:col-span-6">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm mb-2 md:mb-0" />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <select value={editForm.active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, active: e.target.value === 'true'})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-4 flex justify-end gap-2">
                    <button onClick={saveItem} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-sankirtan-muted-dark hover:text-red-400 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-7 md:col-span-6 font-medium">{item.title}</div>
                  <div className="col-span-2 md:col-span-2 flex items-center">
                     <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-sankirtan-green-dark/20 text-sankirtan-green-dark border border-sankirtan-border-dark' : 'bg-red-500/20 text-red-400 border border-sankirtan-border-dark'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-4 flex justify-end gap-2">
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-1.5 text-sankirtan-muted-dark hover:text-sankirtan-gold-dark hover:bg-sankirtan-gold-dark/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => {
                        const { error } = await supabase.from('courses').delete().eq('id', item.id); if (error) { alert('Failed to delete course because there are completions associated with it.'); }
                        fetchItems();
                    }} className="p-1.5 text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}


function OverviewManager({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState({ mentors: 0, batches: 0, mentees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      
      const { count: mentorCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'mentor');
      const { count: batchCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });
      const { count: menteeCount } = await supabase.from('batch_memberships').select('*', { count: 'exact', head: true }).is('left_at', null);

      setStats({
        mentors: mentorCount || 0,
        batches: batchCount || 0,
        mentees: menteeCount || 0
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
     return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
         <Activity className="w-5 h-5 text-sankirtan-gold-dark" />
         Platform Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('mentors')}
          className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark hover:border-sankirtan-gold-dark/50 p-6 rounded-2xl cursor-pointer transition-all group"
        >
           <div className="w-12 h-12 bg-sankirtan-gold-dark/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Shield className="w-6 h-6 text-sankirtan-gold-dark" />
           </div>
           <p className="text-3xl font-bold text-white mb-1">{stats.mentors}</p>
           <p className="text-sankirtan-muted-dark font-medium">Total Mentors</p>
        </div>

        <div 
          onClick={() => setActiveTab('batches')}
          className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark hover:border-sankirtan-gold-dark/50 p-6 rounded-2xl cursor-pointer transition-all group"
        >
           <div className="w-12 h-12 bg-sankirtan-gold-dark/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <List className="w-6 h-6 text-sankirtan-gold-dark" />
           </div>
           <p className="text-3xl font-bold text-white mb-1">{stats.batches}</p>
           <p className="text-sankirtan-muted-dark font-medium">Total Batches</p>
        </div>

        <div 
          onClick={() => setActiveTab('mentees')}
          className="bg-sankirtan-panel-dark/50 border border-sankirtan-border-dark hover:border-sankirtan-gold-dark/50 p-6 rounded-2xl cursor-pointer transition-all group"
        >
           <div className="w-12 h-12 bg-sankirtan-gold-dark/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Users className="w-6 h-6 text-sankirtan-gold-dark" />
           </div>
           <p className="text-3xl font-bold text-white mb-1">{stats.mentees}</p>
           <p className="text-sankirtan-muted-dark font-medium">Total Mentees</p>
        </div>
      </div>
    </div>
  );
}

function MentorsManager() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    
    try {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      );
      
      const { data, error: signUpError } = await tempClient.auth.signUp({
        email: newMentor.email,
        password: '123456',
        options: {
           data: {
              full_name: newMentor.name
           }
        }
      });
      
      if (signUpError) throw signUpError;
      const newUserId = data.user?.id;
      if (!newUserId) throw new Error("Failed to get user ID after sign up");
      
      const { error: insertError } = await supabase.from('users').insert({
        id: newUserId,
        email: newMentor.email,
        full_name: newMentor.name,
        
        role: 'mentor'
      });
      if (insertError) throw insertError;
      
      setMentors([...mentors, { id: newUserId, full_name: newMentor.name, email: newMentor.email, role: 'mentor' }].sort((a,b) => a.full_name.localeCompare(b.full_name)));
      setNewMentor({ name: '', email: '' });
      setShowAdd(false);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || 'Error creating mentor');
    } finally {
      setCreating(false);
    }
  };


  useEffect(() => {
    async function fetchMentors() {
      const { data } = await supabase.from('users').select('id, full_name, email, initiated_name, phone').eq('role', 'mentor').order('full_name');
      if (data) setMentors(data);
      setLoading(false);
    }
    fetchMentors();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold flex items-center gap-2">
           <Shield className="w-5 h-5 text-sankirtan-gold-dark" />
           Mentors
        </h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center px-3 py-1.5 bg-sankirtan-gold-dark text-sankirtan-bg-dark text-sm font-semibold rounded-lg hover:bg-sankirtan-orange-dark transition-colors">
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add Mentor</>}
        </button>
      </div>
      
      {showAdd && (
        <div className="bg-sankirtan-panel-dark p-4 rounded-xl border border-sankirtan-border-dark">
           <h4 className="font-semibold text-sm mb-3">Create New Mentor</h4>
           <form onSubmit={handleCreateMentor} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
             <div className="col-span-1">
               <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Full Name</label>
               <input type="text" required value={newMentor.name} onChange={e => setNewMentor({...newMentor, name: e.target.value})} className="w-full text-sm bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-3 py-2" />
             </div>
             <div className="col-span-1">
               <label className="block text-xs font-semibold text-sankirtan-muted-dark mb-1">Email</label>
               <input type="email" required value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} className="w-full text-sm bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-3 py-2" />
             </div>
             <div className="col-span-1">
               <button type="submit" disabled={creating} className="w-full py-2 bg-sankirtan-green-dark text-sankirtan-bg-dark rounded-lg font-bold text-sm h-[38px]">
                 {creating ? 'Creating...' : 'Create Mentor'}
               </button>
             </div>
             {createError && <p className="text-xs text-red-500 col-span-3 mt-1">{createError}</p>}
             <p className="text-xs text-sankirtan-muted-dark col-span-3 mt-1">Default password will be set to: <strong>123456</strong></p>
           </form>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark min-w-[600px]">
             <div className="col-span-4">Name</div>
             <div className="col-span-4">Email</div>
             <div className="col-span-4">Phone</div>
          </div>
          {mentors.length === 0 ? (
            <p className="text-center py-6 text-sankirtan-muted-dark">No mentors found.</p>
          ) : (
            mentors.map(m => (
              <div key={m.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-sankirtan-border-dark/50 items-center min-w-[600px] hover:bg-sankirtan-bg-dark/40">
                 <div className="col-span-4 font-medium">{m.initiated_name || m.full_name}</div>
                 <div className="col-span-4 text-sankirtan-muted-dark text-sm">{m.email}</div>
                 <div className="col-span-4 text-sankirtan-muted-dark text-sm">{m.phone || '-'}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BatchesManager() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      const { data } = await supabase.from('batches').select('*, users!mentor_id(full_name, initiated_name)').order('created_at', { ascending: false });
      if (data) setBatches(data);
      setLoading(false);
    }
    fetchBatches();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 pb-4 border-b border-sankirtan-border-dark">
         <List className="w-5 h-5 text-sankirtan-gold-dark" />
         Batches
      </h3>
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark min-w-[600px]">
             <div className="col-span-3">Name</div>
             <div className="col-span-3">Mentor</div>
             <div className="col-span-3">Schedule</div>
             <div className="col-span-3">Location</div>
          </div>
          {batches.length === 0 ? (
            <p className="text-center py-6 text-sankirtan-muted-dark">No batches found.</p>
          ) : (
            batches.map(b => (
              <div key={b.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-sankirtan-border-dark/50 items-center min-w-[600px] hover:bg-sankirtan-bg-dark/40">
                 <div className="col-span-3 font-medium text-sm">{b.name}</div>
                 <div className="col-span-3 text-sankirtan-muted-dark text-sm">{b.users?.initiated_name || b.users?.full_name}</div>
                 <div className="col-span-3 text-sankirtan-muted-dark text-sm line-clamp-1">{b.schedule}</div>
                 <div className="col-span-3 text-sankirtan-muted-dark text-sm line-clamp-1">{b.location}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MenteesManager() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentees() {
      // We want to list mentee names & corresponding mentor.
      // Easiest is from batch_memberships
      const { data } = await supabase.from('batch_memberships').select(`
        mentee_id,
        users!mentee_id (id, full_name, initiated_name, email),
        batches (
           name,
           users!mentor_id (full_name, initiated_name)
        )
      `).is('left_at', null);

      if (data) {
        setMentees(data);
      }
      setLoading(false);
    }
    fetchMentees();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 pb-4 border-b border-sankirtan-border-dark">
         <Users className="w-5 h-5 text-sankirtan-gold-dark" />
         Mentees
      </h3>
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-sankirtan-gold-dark border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark min-w-[600px]">
             <div className="col-span-4">Mentee Name</div>
             <div className="col-span-4">Email</div>
             <div className="col-span-4">Mentor & Batch</div>
          </div>
          {mentees.length === 0 ? (
            <p className="text-center py-6 text-sankirtan-muted-dark">No mentees found.</p>
          ) : (
            mentees.map((m, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-sankirtan-border-dark/50 items-center min-w-[600px] hover:bg-sankirtan-bg-dark/40">
                 <div className="col-span-4 font-medium text-sm">{m.users?.initiated_name || m.users?.full_name}</div>
                 <div className="col-span-4 text-sankirtan-muted-dark text-sm">{m.users?.email}</div>
                 <div className="col-span-4 flex flex-col items-start text-sm">
                   <span className="text-sankirtan-text-dark/90">{m.batches?.users?.initiated_name || m.batches?.users?.full_name}</span>
                   <span className="text-xs bg-sankirtan-panel-dark px-1.5 py-0.5 mt-1 rounded text-sankirtan-gold-dark">{m.batches?.name}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


function ModulesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('modules').select('*').order('order_index');
    if (data) setItems(data);
    setLoading(false);
  };

  const saveItem = async () => {
    if (!editForm.title) return;
    
    if (isCreating) {
      await supabase.from('modules').insert([editForm]);
    } else if (editingId) {
      await supabase.from('modules').update(editForm).eq('id', editingId);
    }
    
    setIsCreating(false);
    setEditingId(null);
    setEditForm({});
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (window.confirm('Delete this module?')) {
      await supabase.from('batch_modules').delete().eq('module_id', id); await supabase.from('modules').delete().eq('id', id);
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-sankirtan-border-dark">
        <h3 className="text-xl font-bold flex items-center gap-2"><BookText className="w-5 h-5 text-sankirtan-gold-dark" /> Modules Syllabus</h3>
        <button
          onClick={() => { setEditingId('new'); setEditForm({ title: '', description: '', order_index: items.length + 1 }); setIsCreating(true); }}
          className="bg-sankirtan-gold-dark text-sankirtan-bg-dark px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-sankirtan-gold-dark/90 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {loading ? (
         <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-sankirtan-bg-dark/50 border border-sankirtan-border-dark rounded-2xl overflow-hidden">
            {(items.length > 0 || isCreating) && (
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-sankirtan-muted-dark border-b border-sankirtan-border-dark min-w-[600px] overflow-x-auto">
              <div className="col-span-2">Order</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            )}
            
            {!isCreating && items.length === 0 && (
              <p className="text-sankirtan-muted-dark text-center py-10">No modules yet.</p>
            )}
          
          {isCreating && (
            <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-sankirtan-bg-dark/50 border-b border-sankirtan-gold-dark/30 min-w-[600px] overflow-x-auto">
              <div className="col-span-2">
                <input type="number" value={editForm.order_index || ''} onChange={e => setEditForm({...editForm, order_index: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
              </div>
              <div className="col-span-4">
                <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" placeholder="Module Title" />
              </div>
              <div className="col-span-4">
                <input type="text" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" placeholder="Description" />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button onClick={saveItem} className="p-1.5 bg-sankirtan-gold-dark/20 text-sankirtan-gold-dark rounded-lg hover:bg-sankirtan-gold-dark/30"><CheckCircle2 className="w-4 h-4" /></button>
                <button onClick={() => setIsCreating(false)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-sankirtan-border-dark/50 hover:bg-sankirtan-bg-dark transition-colors min-w-[600px] overflow-x-auto">
              {editingId === item.id ? (
                <>
                  <div className="col-span-2">
                    <input type="number" value={editForm.order_index || ''} onChange={e => setEditForm({...editForm, order_index: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-4">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-4">
                    <input type="text" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button onClick={saveItem} className="p-1.5 bg-sankirtan-gold-dark/20 text-sankirtan-gold-dark rounded-lg hover:bg-sankirtan-gold-dark/30"><CheckCircle2 className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-sankirtan-muted-dark/20 text-sankirtan-muted-dark rounded-lg hover:bg-sankirtan-muted-dark/40"><X className="w-4 h-4" /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 font-medium">{item.order_index}</div>
                  <div className="col-span-4 font-bold">{item.title}</div>
                  <div className="col-span-4 text-sankirtan-muted-dark truncate">{item.description || '-'}</div>
                  <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-1.5 bg-sankirtan-panel-dark text-sankirtan-gold-dark rounded-lg hover:bg-sankirtan-gold-dark/10 border border-sankirtan-border-dark"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 bg-sankirtan-panel-dark text-red-500 rounded-lg hover:bg-red-500/10 border border-sankirtan-border-dark"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
