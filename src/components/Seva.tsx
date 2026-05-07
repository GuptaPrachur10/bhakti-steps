import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { HeartHandshake, Save, Clock, Calendar } from 'lucide-react';

export default function Seva({ user }: { user: User }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    department_id: '',
    duration_hours: 1,
    description: '',
    other_department_name: ''
  });

  useEffect(() => {
    fetchData();
  }, [user.id, page]);

  const fetchData = async () => {
    setLoading(true);
    const { data: deptData } = await supabase
      .from('departments')
      .select('*')
      .eq('active', true)
      .order('name');
    if (deptData) {
      setDepartments(deptData);
      if (deptData.length > 0) {
        setFormData(prev => ({ ...prev, department_id: deptData[0].id }));
      }
    }

    const { data: logsData } = await supabase
      .from('service_logs')
      .select(`
        *,
        departments (name)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1);
    if (logsData) {
      setLogs(logsData);
      setHasMore(logsData.length === 10);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.department_id) return;
    setLoading(true);
    
    // Check if other
    const selectedDept = departments.find(d => d.id === formData.department_id);
    const isOther = selectedDept?.name?.toLowerCase() === 'other';

    const payload = {
      ...formData,
      user_id: user.id,
      other_department_name: isOther ? formData.other_department_name : null
    };

    await supabase.from('service_logs').insert(payload);
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      department_id: departments.length > 0 ? departments[0].id : '',
      duration_hours: 1,
      description: '',
      other_department_name: ''
    });
    
    await fetchData();
  };

  const selectedDept = departments.find(d => d.id === formData.department_id);
  const isOther = selectedDept?.name?.toLowerCase() === 'other';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-sankirtan-gold-dark" />
          Seva (Service) Log
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 self-start">
          <h3 className="text-lg font-bold border-b border-sankirtan-border-dark pb-4">Log New Service</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark" 
              />
            </div>
            
            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Department / Area</label>
              <select 
                value={formData.department_id} 
                onChange={e => setFormData({...formData, department_id: e.target.value})} 
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {isOther && (
               <div>
                 <label className="block text-sm text-sankirtan-muted-dark mb-1">Specify Area</label>
                 <input 
                   type="text" 
                   value={formData.other_department_name} 
                   onChange={e => setFormData({...formData, other_department_name: e.target.value})} 
                   placeholder="E.g., Event Management"
                   className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark" 
                 />
               </div>
            )}

            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Duration (Hours)</label>
              <input 
                type="number" 
                min="0.5" step="0.5"
                value={formData.duration_hours} 
                onChange={e => setFormData({...formData, duration_hours: parseFloat(e.target.value) || 0})} 
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark" 
              />
            </div>

            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                rows={3}
                placeholder="Briefly describe your service..."
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark resize-none" 
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-sankirtan-gold-dark to-sankirtan-orange-dark text-sankirtan-bg-dark font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-sankirtan-bg-dark/20 border-t-sankirtan-bg-dark rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
              Save Seva Log
            </button>
          </div>
        </div>

        <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl h-[600px] flex flex-col">
           <h3 className="text-lg font-bold mb-4 shrink-0">Recent Seva Logs</h3>
           <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {logs.length === 0 ? (
                <p className="text-sankirtan-muted-dark text-center py-6">No service logged yet.</p>
             ) : (
                <>
                {logs.map(log => (
                  <div key={log.id} className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/30 border border-sankirtan-border-dark/60 p-5 rounded-2xl shadow-inner transition-all hover:shadow-lg">
                     <div className="flex justify-between items-start mb-2">
                       <p className="font-bold">{log.departments?.name === 'Other' && log.other_department_name ? log.other_department_name : log.departments?.name}</p>
                       <span className="flex items-center gap-1 text-xs font-semibold bg-sankirtan-gold-dark/10 text-sankirtan-gold-dark px-2 py-1 rounded-md">
                         <Clock className="w-3 h-3" />
                         {log.duration_hours} hr
                       </span>
                     </div>
                     <p className="text-xs text-sankirtan-muted-dark flex items-center gap-1 mb-2">
                       <Calendar className="w-3 h-3" /> {new Date(log.date).toLocaleDateString()}
                     </p>
                     {log.description && (
                       <p className="text-sm text-sankirtan-muted-dark italic">"{log.description}"</p>
                     )}
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4 pb-2">
                  <button 
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 bg-sankirtan-bg-dark rounded-lg text-sm border border-sankirtan-border-dark disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-sankirtan-muted-dark">Page {page + 1}</span>
                  <button 
                    onClick={() => setPage(page + 1)}
                    disabled={!hasMore}
                    className="px-3 py-1 bg-sankirtan-bg-dark rounded-lg text-sm border border-sankirtan-border-dark disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
