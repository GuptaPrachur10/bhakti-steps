import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { Save, Edit2, X, AlertCircle, CheckCircle2 } from 'lucide-react';

type UserRow = Database['public']['Tables']['users']['Row'];
type SpiritualMaster = Database['public']['Tables']['spiritual_masters']['Row'];

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [spiritualMasters, setSpiritualMasters] = useState<SpiritualMaster[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UserRow>>({});

  useEffect(() => {
    fetchProfileAndMasters();
  }, [user.id]);

  const fetchProfileAndMasters = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch spiritual masters
      const { data: masters, error: mastersError } = await supabase
        .from('spiritual_masters')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (mastersError) throw mastersError;
      setSpiritualMasters(masters || []);

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist yet, we might need to create it (if that's how the app works)
          // For now, we'll just set an empty state if it's completely missing
          setError('Profile not found in the database. Please contact an administrator.');
        } else {
          throw profileError;
        }
      } else {
        setProfile(userProfile);
        setFormData(userProfile);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError(null);
    
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new
    });
    
    if (error) {
      setPasswordError(error.message);
    } else {
      setSuccessMessage("Password changed successfully.");
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
    setPasswordLoading(false);
  };
  
  const handleInputChange =  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value === '' ? null : Number(value)) : 
              value
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(profile || {});
    setError(null);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!profile?.id) throw new Error("No profile to update");

      // Clean up data for update
      const updateData = { ...formData, updated_at: new Date().toISOString() };
      
      // Remove fields we shouldn't update directly here if necessary
      delete updateData.id;
      delete updateData.created_at;

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      setFormData(data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-sankirtan-gold-dark/20 border-t-sankirtan-gold-dark rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="bg-sankirtan-panel-dark rounded-2xl shadow-xl p-6 md:p-8 border border-sankirtan-border-dark text-center overflow-x-auto">
        <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg md:text-xl font-bold text-sankirtan-text-dark mb-2">Profile Not Found</h2>
        <p className="text-sm md:text-base text-sankirtan-muted-dark">
          {error || "We couldn't find your profile in the database. Please contact an administrator."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sankirtan-panel-dark rounded-2xl shadow-xl border border-sankirtan-border-dark overflow-hidden">
      <div className="p-4 md:p-6 border-b border-sankirtan-border-dark flex flex-col sm:flex-row sm:justify-between sm:items-center bg-sankirtan-bg-dark/50 gap-4 transition-all">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-sankirtan-text-dark tracking-tight">My Profile</h2>
        </div>
        
        {!isEditing ? (
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-center flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-sankirtan-gold-dark bg-sankirtan-panel-dark border border-sankirtan-gold-dark/30 rounded-xl hover:bg-sankirtan-gold-dark/10 transition-all focus:outline-none focus:ring-2 focus:ring-sankirtan-gold-dark/50 whitespace-nowrap"
            >
              Change Password
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-sankirtan-bg-dark bg-sankirtan-gold-dark rounded-xl hover:bg-sankirtan-orange-dark hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-sankirtan-gold-dark/50 whitespace-nowrap"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-semibold text-sankirtan-text-dark bg-transparent border border-sankirtan-border-dark rounded-xl hover:bg-sankirtan-bg-dark transition-all focus:outline-none disabled:opacity-50 whitespace-nowrap"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-semibold text-sankirtan-bg-dark bg-sankirtan-green-dark rounded-xl hover:bg-green-500 transition-all focus:outline-none disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-sankirtan-bg-dark/20 border-t-sankirtan-bg-dark rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 overflow-x-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-500/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basic Information */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold text-sankirtan-gold-dark border-b border-sankirtan-border-dark pb-2">
              Basic Information
            </h3>
            
            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                disabled={true} // Email should usually be read-only as it's tied to auth
                title="Email is managed via authentication settings"
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-muted-dark opacity-70 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all resize-none"
              />
            </div>
            
            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Role</label>
              <div className="px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-muted-dark opacity-70">
                <span className="capitalize">{formData.role || 'User'}</span>
              </div>
            </div>
          </div>

          {/* Spiritual Information */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold text-sankirtan-gold-dark border-b border-sankirtan-border-dark pb-2 mt-8 md:mt-0">
              Spiritual Details
            </h3>

            <div className="flex items-center bg-sankirtan-bg-dark p-3 md:p-4 rounded-xl border border-sankirtan-border-dark">
              <input
                type="checkbox"
                id="is_initiated"
                name="is_initiated"
                checked={formData.is_initiated || false}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-4 h-4 md:w-5 md:h-5 bg-sankirtan-panel-dark border-sankirtan-border-dark text-sankirtan-gold-dark focus:ring-sankirtan-gold-dark/50 rounded cursor-pointer disabled:cursor-not-allowed shrink-0"
              />
              <label htmlFor="is_initiated" className="ml-2 md:ml-3 block text-sm md:text-base font-semibold text-sankirtan-text-dark cursor-pointer">
                Are you initiated?
              </label>
            </div>

            {formData.is_initiated && (
              <>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Initiated Name</label>
                  <input
                    type="text"
                    name="initiated_name"
                    value={formData.initiated_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Initiation Year</label>
                  <input
                    type="number"
                    name="initiation_year"
                    value={formData.initiation_year || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    min="1965"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Spiritual Master</label>
              <select
                name="spiritual_master_id"
                value={formData.spiritual_master_id || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Select a Spiritual Master</option>
                {spiritualMasters.map(master => (
                  <option key={master.id} value={master.id}>{master.name}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>

            {formData.spiritual_master_id === 'other' && (
              <div>
                <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Other Spiritual Master Name</label>
                <input
                  type="text"
                  name="other_spiritual_master"
                  value={formData.other_spiritual_master || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Home Temple / ISKCON Center</label>
              <input
                type="text"
                name="home_temple"
                value={formData.home_temple || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-sankirtan-muted-dark mb-1">Daily Japa Target (Rounds)</label>
              <input
                type="number"
                name="japa_target"
                value={formData.japa_target || 16}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="0"
                max="108"
                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl text-sankirtan-text-dark focus:ring-1 focus:ring-sankirtan-gold-dark focus:border-sankirtan-gold-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

        </div>
      </div>
      
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-sankirtan-panel-dark rounded-2xl shadow-xl border border-sankirtan-border-dark w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-sankirtan-border-dark flex justify-between items-center bg-sankirtan-bg-dark/50">
              <h3 className="font-bold text-lg">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-sankirtan-muted-dark hover:text-sankirtan-text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-left">
              {passwordError && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2 text-sm text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{passwordError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full px-4 py-2.5 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl focus:border-sankirtan-gold-dark"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-sankirtan-muted-dark mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full px-4 py-2.5 bg-sankirtan-bg-dark border border-sankirtan-border-dark rounded-xl focus:border-sankirtan-gold-dark"
                  required
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 bg-transparent border border-sankirtan-border-dark rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={passwordLoading} className="flex-1 py-2.5 bg-sankirtan-gold-dark text-sankirtan-bg-dark rounded-xl font-bold flex justify-center items-center">
                  {passwordLoading ? <div className="w-5 h-5 border-2 border-sankirtan-bg-dark/20 border-t-sankirtan-bg-dark rounded-full animate-spin"></div> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
