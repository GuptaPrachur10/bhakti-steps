import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Activity, Calendar as CalendarIcon, Save, Edit2, CheckCircle2, Plus, Trash2, BookOpen } from 'lucide-react';

export default function Sadhana({ user }: { user: User }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [formData, setFormData] = useState({
    rounds: 0,
    mangala_arati: false,
    tulasi_puja: false,
    guru_puja: false,
    bg_class: false,
    japa_session: false,
    evening_kirtana: false,
    mood: 'Good',
    notes: ''
  });
  const [existingLog, setExistingLog] = useState<any>(null);
  const [prabhupadaBooks, setPrabhupadaBooks] = useState<any[]>([]);
  const [bookReadings, setBookReadings] = useState<{book_id: string, other_book_title: string, duration_minutes: number}[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchBooks();
  }, [user.id, date, page]);

  const fetchBooks = async () => {
    const { data } = await supabase.from('prabhupada_books').select('id, title').eq('active', true).order('title');
    if (data) setPrabhupadaBooks(data);
  };

  const fetchLogs = async () => {
    setLoading(true);
    // Fetch paginated logs
    const { data: allLogs } = await supabase
      .from('sadhana_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1);
      
    if (allLogs) {
      setLogs(allLogs);
      setHasMore(allLogs.length === 10);
    } else {
      setHasMore(false);
    }

    // Fetch specific date log
    const { data: specificLog } = await supabase
      .from('sadhana_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single();
      
    if (specificLog) {
      setExistingLog(specificLog);
      
      const { data: readingsData } = await supabase.from('sadhana_book_readings').select('*').eq('sadhana_log_id', specificLog.id);
      if (readingsData && readingsData.length > 0) {
        setBookReadings(readingsData.map(r => ({
          book_id: r.book_id || '',
          other_book_title: r.other_book_title || '',
          duration_minutes: r.duration_minutes || 0
        })));
      } else {
        setBookReadings([]);
      }
      setFormData({
        rounds: specificLog.rounds || 0,
        mangala_arati: specificLog.mangala_arati || false,
        tulasi_puja: specificLog.tulasi_puja || false,
        guru_puja: specificLog.guru_puja || false,
        bg_class: specificLog.bg_class || false,
        japa_session: specificLog.japa_session || false,
        evening_kirtana: specificLog.evening_kirtana || false,
        mood: specificLog.mood || 'Good',
        notes: specificLog.notes || ''
      });
    } else {
      setExistingLog(null);
      setBookReadings([]);
      setFormData({
        rounds: 0,
        mangala_arati: false,
        tulasi_puja: false,
        guru_puja: false,
        bg_class: false,
        japa_session: false,
        evening_kirtana: false,
        mood: 'Good',
        notes: ''
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Calculate a basic score (0-100)
    let score = 0;
    score += Math.min(formData.rounds * 3, 40); // Up to 40 points for 16 rounds
    if (formData.mangala_arati) score += 15;
    if (formData.tulasi_puja) score += 10;
    if (formData.guru_puja) score += 10;
    if (formData.bg_class) score += 10;
    if (formData.japa_session) score += 10;
    if (formData.evening_kirtana) score += 5;
    
    score = Math.min(score, 100);

    const payload = {
      user_id: user.id,
      date: date,
      ...formData,
      score
    };

    let logId = existingLog?.id;
    if (existingLog) {
      await supabase.from('sadhana_logs').update(payload).eq('id', existingLog.id);
    } else {
      const { data } = await supabase.from('sadhana_logs').insert(payload).select().single();
      if (data) logId = data.id;
    }
    
    if (logId) {
       await supabase.from('sadhana_book_readings').delete().eq('sadhana_log_id', logId);
       
       const validReadings = bookReadings.filter(r => r.book_id && r.duration_minutes > 0);
       if (validReadings.length > 0) {
         await supabase.from('sadhana_book_readings').insert(
           validReadings.map(r => ({ ...r, sadhana_log_id: logId }))
         );
       }
    }
    
    await fetchLogs();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-sankirtan-gold-dark" />
          Sadhana Tracker
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-sankirtan-border-dark pb-4">
             <h3 className="text-lg font-bold">Log for Date</h3>
             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 focus:outline-none focus:border-sankirtan-gold-dark" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Japa Rounds</label>
              <input 
                type="number" 
                min="0" max="64"
                value={formData.rounds} 
                onChange={e => setFormData({...formData, rounds: parseInt(e.target.value) || 0})} 
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'mangala_arati', label: 'Mangala Arati' },
                { key: 'tulasi_puja', label: 'Tulasi Puja' },
                { key: 'japa_session', label: 'Morning Japa' },
                { key: 'guru_puja', label: 'Guru Puja' },
                { key: 'bg_class', label: 'Srimad Bhagavatam' },
                { key: 'evening_kirtana', label: 'Evening Kirtana' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-sankirtan-bg-dark rounded-xl border border-sankirtan-border-dark cursor-pointer hover:border-sankirtan-gold-dark/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData[item.key as keyof typeof formData] as boolean} 
                    onChange={e => setFormData({...formData, [item.key]: e.target.checked})} 
                    className="w-4 h-4 rounded border-sankirtan-border-dark text-sankirtan-gold-dark focus:ring-sankirtan-gold-dark focus:ring-offset-gray-900"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Mood</label>
              <select 
                value={formData.mood} 
                onChange={e => setFormData({...formData, mood: e.target.value})} 
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark"
              >
                <option>Enthusiastic</option>
                <option>Good</option>
                <option>Average</option>
                <option>Struggling</option>
              </select>
            </div>

            <div className="border-t border-sankirtan-border-dark pt-5 mt-5">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-sankirtan-gold-dark flex items-center gap-2"><BookOpen className="w-4 h-4"/> Book Readings</label>
                <button onClick={() => setBookReadings([...bookReadings, { book_id: '', other_book_title: '', duration_minutes: 0 }])} className="text-xs flex items-center bg-sankirtan-panel-dark px-2 py-1 rounded-lg hover:bg-sankirtan-border-dark transition-colors"><Plus className="w-3 h-3 mr-1" /> Add Book</button>
              </div>
              
              {bookReadings.length === 0 ? (
                <p className="text-sm text-sankirtan-muted-dark italic mb-4">No book reading logged today.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {bookReadings.map((reading, index) => (
                    <div key={index} className="flex gap-2 items-start bg-sankirtan-bg-dark border border-sankirtan-border-dark p-3 rounded-xl">
                      <div className="flex-1 space-y-2">
                        <select 
                          value={reading.book_id}
                          onChange={e => {
                            const newArr = [...bookReadings];
                            newArr[index].book_id = e.target.value;
                            if (e.target.value !== 'other') newArr[index].other_book_title = '';
                            setBookReadings(newArr);
                          }}
                          className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm focus:border-sankirtan-gold-dark focus:outline-none"
                        >
                          <option value="">Select a book...</option>
                          {prabhupadaBooks.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                          <option value="other">Other...</option>
                        </select>
                        
                        {reading.book_id === 'other' && (
                          <input 
                            type="text"
                            placeholder="Specify other book..."
                            value={reading.other_book_title}
                            onChange={e => {
                              const newArr = [...bookReadings];
                              newArr[index].other_book_title = e.target.value;
                              setBookReadings(newArr);
                            }}
                            className="w-full bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm focus:border-sankirtan-gold-dark focus:outline-none"
                          />
                        )}
                        
                        <div className="flex items-center gap-2">
                           <input 
                              type="number"
                              min="0"
                              placeholder="Mins"
                              value={reading.duration_minutes || ''}
                              onChange={e => {
                                const newArr = [...bookReadings];
                                newArr[index].duration_minutes = parseInt(e.target.value) || 0;
                                setBookReadings(newArr);
                              }}
                              className="w-24 bg-sankirtan-panel-dark border border-sankirtan-border-dark rounded-lg px-3 py-1.5 text-sm focus:border-sankirtan-gold-dark focus:outline-none"
                           />
                           <span className="text-xs text-sankirtan-muted-dark">minutes read</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const newArr = [...bookReadings];
                          newArr.splice(index, 1);
                          setBookReadings(newArr);
                        }}
                        className="text-sankirtan-muted-dark hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-sankirtan-muted-dark mb-1">Notes</label>
              <textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                rows={3}
                placeholder="Any special realizations or challenges today..."
                className="w-full bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-lg px-4 py-2 focus:outline-none focus:border-sankirtan-gold-dark resize-none" 
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-sankirtan-gold-dark to-sankirtan-orange-dark text-sankirtan-bg-dark font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-sankirtan-bg-dark/20 border-t-sankirtan-bg-dark rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
              {existingLog ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>

        <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl">
           <h3 className="text-lg font-bold mb-4">Recent History</h3>
           <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
             {logs.length === 0 ? (
                <p className="text-sankirtan-muted-dark text-center py-6">No logs recorded yet.</p>
             ) : (
                <>
                {logs.map(log => (
                  <div key={log.id} onClick={() => setDate(log.date)} className="bg-gradient-to-br from-sankirtan-bg-dark to-sankirtan-bg-dark/30 border border-sankirtan-border-dark/60 p-5 rounded-2xl shadow-inner transition-all hover:shadow-lg cursor-pointer hover:border-sankirtan-gold-dark/50 transition-colors flex items-center justify-between">
                     <div>
                       <p className="font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-sankirtan-gold-dark" /> {new Date(log.date).toLocaleDateString()}</p>
                       <p className="text-sm text-sankirtan-muted-dark mt-1">{log.rounds} Rounds • Score: {log.score}%</p>
                     </div>
                     {log.date === date ? <Edit2 className="w-4 h-4 text-sankirtan-gold-dark" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
                <div className="flex justify-between items-center mt-4">
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
