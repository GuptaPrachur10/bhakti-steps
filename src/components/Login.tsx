import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Check if we're using placeholder credentials
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      setError('Missing Supabase credentials. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your AI Studio secrets.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // Successfully logged in
      console.log('Logged in user:', data.user);
      // Future routing goes here
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 font-sans relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sankirtan-gold-dark/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sankirtan-orange-dark/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-md w-full bg-sankirtan-panel-dark/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-sankirtan-border-dark z-10 relative">
        <div className="p-8 pb-6 text-center border-b border-sankirtan-border-dark">
          <h1 className="text-3xl font-bold text-sankirtan-text-dark tracking-tight mb-2">Bhakti Steps</h1>
          <p className="text-sankirtan-gold-dark font-medium">Login to your account</p>
        </div>
        
        <div className="p-8 pt-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-sankirtan-muted-dark" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-sankirtan-border-dark rounded-xl bg-sankirtan-bg-dark text-sankirtan-text-dark placeholder-sankirtan-muted-dark focus:outline-none focus:ring-2 focus:ring-sankirtan-gold-dark/50 focus:border-sankirtan-gold-dark sm:text-sm transition-all"
                  placeholder="devotee@iskcon.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sankirtan-muted-dark" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-sankirtan-border-dark rounded-xl bg-sankirtan-bg-dark text-sankirtan-text-dark placeholder-sankirtan-muted-dark focus:outline-none focus:ring-2 focus:ring-sankirtan-gold-dark/50 focus:border-sankirtan-gold-dark sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg border border-sankirtan-gold-dark/50 text-sm font-bold text-sankirtan-bg-dark bg-sankirtan-gold-dark hover:bg-sankirtan-orange-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sankirtan-panel-dark focus:ring-sankirtan-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-sankirtan-bg-dark/20 border-t-sankirtan-bg-dark rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center px-4">
            <p className="text-xs text-sankirtan-muted-dark leading-relaxed">
              Only authorized members can access this app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
