import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { BookText, CheckCircle2, Circle, BookOpen } from 'lucide-react';

export default function Books({ user }: { user: User }) {
  const [books, setBooks] = useState<any[]>([]);
  const [menteeBooks, setMenteeBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: booksData } = await supabase
        .from('prabhupada_books')
        .select('*')
        .eq('active', true)
        .order('title', { ascending: true });
        
      if (booksData) setBooks(booksData);

      const { data: mbData } = await supabase
        .from('mentee_books')
        .select('*')
        .eq('user_id', user.id);
        
      if (mbData) setMenteeBooks(mbData);
      setLoading(false);
    }
    fetchData();
  }, [user.id]);

  const updateBookStatus = async (bookId: string, status: string) => {
    const existing = menteeBooks.find(mb => mb.book_id === bookId);
    
    if (existing) {
      const payload = { status };
      await supabase.from('mentee_books').update(payload).eq('id', existing.id);
      setMenteeBooks(menteeBooks.map(mb => mb.id === existing.id ? { ...mb, ...payload } : mb));
    } else {
      const payload = {
        user_id: user.id,
        book_id: bookId,
        status,
        owned: false
      };
      const { data } = await supabase.from('mentee_books').insert(payload).select().single();
      if (data) {
        setMenteeBooks([...menteeBooks, data]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookText className="w-6 h-6 text-sankirtan-gold-dark" />
          My Books
        </h2>
      </div>

      <div className="bg-sankirtan-panel-dark/50 backdrop-blur-md/60 backdrop-blur-md border border-sankirtan-border-dark/50 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div></div>
        ) : books.length === 0 ? (
          <p className="text-sankirtan-muted-dark text-center py-10">No books available in library.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => {
              const mb = menteeBooks.find(m => m.book_id === book.id);
              const status = mb?.status || 'not_started';
              
              return (
                <div key={book.id} className="bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2">
                     <select 
                       value={status} 
                       onChange={(e) => updateBookStatus(book.id, e.target.value)}
                       className="bg-sankirtan-panel-dark/50 backdrop-blur-md border border-sankirtan-border-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sankirtan-gold-dark"
                     >
                       <option value="not_started">Not Started</option>
                       <option value="reading">Reading</option>
                       <option value="completed">Completed</option>
                     </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
