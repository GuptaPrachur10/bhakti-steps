import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, ChevronDown, Menu, Shield, Users, BookOpen, BookText, Activity, HeartHandshake } from 'lucide-react';
import Profile from './Profile';
import Admin from './Admin';
import MentorPanel from './Mentor';
import MenteeHome from './MenteeHome';
import Sadhana from './Sadhana';
import Courses from './Courses';
import Books from './Books';
import Seva from './Seva';

interface DashboardProps {
  user: User;
}

type Tab = 'dashboard' | 'profile' | 'admin' | 'mentor' | 'sadhana' | 'courses' | 'books' | 'seva';

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [dbFullName, setDbFullName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = dbFullName || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Devotee';

  // Fetch role and close dropdown behavior
  useEffect(() => {
    async function fetchRole() {
      const { data, error } = await supabase.from('users').select('role, full_name').eq('id', user.id).single();
      if (data && !error) {
        setUserRole(data.role);
        setDbFullName(data.full_name || '');
      }
    }
    fetchRole();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user.id]);

  return (
    <div className="min-h-screen bg-sankirtan-bg-dark text-sankirtan-text-dark font-sans flex flex-col md:flex-row">
      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header Bar */}
        <header className="bg-sankirtan-panel-dark/60 backdrop-blur-xl border-b border-sankirtan-border-dark px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-sankirtan-gold-dark tracking-tight">Bhakti Steps</h1>
            <div className="hidden md:block text-sankirtan-muted-dark">|</div>
            <h2 className="text-lg md:text-2xl font-bold text-sankirtan-text-dark md:hidden tracking-tight truncate">Welcome {displayName}</h2>
            <div className="hidden md:block truncate">
               <span className="text-base md:text-lg text-sankirtan-muted-dark">Welcome, </span>
               <span className="text-base md:text-lg font-bold text-sankirtan-gold-dark">{displayName}</span>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-sankirtan-bg-dark p-2 rounded-xl transition-colors border border-transparent hover:border-sankirtan-border-dark focus:outline-none focus:ring-2 focus:ring-sankirtan-gold-dark/50"
            >
              <div className="w-10 h-10 bg-sankirtan-bg-dark rounded-full border border-sankirtan-border-dark flex items-center justify-center shrink-0">
                 <UserIcon className="w-5 h-5 text-sankirtan-gold-dark" />
              </div>
              <ChevronDown className={`w-4 h-4 text-sankirtan-muted-dark transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-sankirtan-panel-dark/95 backdrop-blur-2xl border border-sankirtan-border-dark rounded-2xl shadow-2xl py-2 z-50 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                 <div className="px-4 py-3 border-b border-sankirtan-border-dark mb-2">
                   <p className="text-sm font-bold text-sankirtan-text-dark truncate">{displayName}</p>
                   <p className="text-xs text-sankirtan-muted-dark truncate">{user.email}</p>
                 </div>
                 
                 {/* Mobile nav items */}
                 <div className="border-b border-sankirtan-border-dark mb-2 pb-2">
                    <button 
                      onClick={() => { setActiveTab('dashboard'); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                        activeTab === 'dashboard' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    
                    {userRole !== 'admin' && userRole !== 'mentor' && (
                      <>
                        <button 
                          onClick={() => { setActiveTab('sadhana'); setShowDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                            activeTab === 'sadhana' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                          }`}
                        >
                          <Activity className="w-4 h-4" /> Sadhana
                        </button>
                        <button 
                          onClick={() => { setActiveTab('courses'); setShowDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                            activeTab === 'courses' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" /> Courses
                        </button>
                        <button 
                          onClick={() => { setActiveTab('books'); setShowDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                            activeTab === 'books' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                          }`}
                        >
                          <BookText className="w-4 h-4" /> Books
                        </button>
                        <button 
                          onClick={() => { setActiveTab('seva'); setShowDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                            activeTab === 'seva' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                          }`}
                        >
                          <HeartHandshake className="w-4 h-4" /> Seva
                        </button>
                      </>
                    )}
                 </div>

                 <button 
                   onClick={() => { setActiveTab('profile'); setShowDropdown(false); }}
                   className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                     activeTab === 'profile' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                   }`}
                 >
                   <Settings className="w-4 h-4"/> My Profile
                 </button>

                 {userRole === 'admin' && (
                   <button 
                     onClick={() => { setActiveTab('admin'); setShowDropdown(false); }}
                     className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                       activeTab === 'admin' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                     }`}
                   >
                     <Shield className="w-4 h-4"/> Admin Panel
                   </button>
                 )}

                 {userRole === 'mentor' && (
                   <button 
                     onClick={() => { setActiveTab('mentor'); setShowDropdown(false); }}
                     className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                       activeTab === 'mentor' ? 'text-sankirtan-gold-dark bg-sankirtan-bg-dark/50 font-semibold' : 'text-sankirtan-muted-dark hover:bg-sankirtan-bg-dark hover:text-sankirtan-text-dark'
                     }`}
                   >
                     <Users className="w-4 h-4"/> Mentor Panel
                   </button>
                 )}
                 
                 <div className="border-t border-sankirtan-border-dark my-2 lg:my-1"></div>
                 
                 <button 
                   onClick={handleLogout} 
                   className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-900/20 hover:text-red-400 flex items-center gap-3 transition-colors"
                 >
                   <LogOut className="w-4 h-4"/> Sign Out
                 </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' ? (              <MenteeHome user={user} displayName={displayName} userRole={userRole} />            ) : activeTab === 'sadhana' ? (              <Sadhana user={user} />            ) : activeTab === 'courses' ? (              <Courses user={user} />            ) : activeTab === 'books' ? (              <Books user={user} />            ) : activeTab === 'seva' ? (              <Seva user={user} />            ) : activeTab === 'profile' ? (              <Profile user={user} />            ) : activeTab === 'mentor' ? (              <MentorPanel user={user} />            ) : (              <Admin />            )}
          </div>
        </main>
      </div>
    </div>
  );
}
