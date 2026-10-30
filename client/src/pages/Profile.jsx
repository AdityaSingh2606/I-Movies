import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Lock, Shield, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    await updateProfile({ name, phone, avatar });
    setUpdatingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container px-4 px-lg-5 py-5" style={{ maxWidth: '900px' }}>
      <div className="mb-4">
        <h1 className="fw-bold text-white display-font mb-1">
          Account <span className="glow-text">Profile</span>
        </h1>
        <p className="text-secondary small">Manage personal details, security credentials, and alert history</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Edit Profile */}
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <User size={20} className="text-info" />
              <span>Personal Information</span>
            </h5>

            <div className="d-flex align-items-center gap-3 mb-4">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt="Avatar"
                className="rounded-circle border border-info"
                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
              />
              <div>
                <div className="fw-bold text-white fs-6">{user?.name}</div>
                <div className="text-secondary small">{user?.email}</div>
                <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'} extra-small mt-1`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control cinematic-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-semibold">Email Address (Immutable)</label>
                <input
                  type="email"
                  className="form-control cinematic-input bg-dark opacity-50"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-semibold">Phone Number</label>
                <input
                  type="text"
                  className="form-control cinematic-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-semibold">Avatar Image URL</label>
                <input
                  type="url"
                  className="form-control cinematic-input"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="btn glow-btn rounded-pill mt-2 py-2 fw-semibold"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Password */}
        <div className="col-lg-6">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <Lock size={20} className="text-warning" />
              <span>Change Password</span>
            </h5>

            <form onSubmit={handleChangePassword} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control cinematic-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-semibold">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  className="form-control cinematic-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control cinematic-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-warning rounded-pill mt-2 py-2 fw-semibold"
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Activity Alerts */}
          <div className="glass-card p-4">
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <Bell size={20} className="text-info" />
              <span>Recent Activity Alerts</span>
            </h5>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div className="text-muted small">No notifications on file.</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n._id} className="p-2 border-bottom border-secondary border-opacity-25 extra-small">
                    <div className="text-white fw-semibold">{n.title}</div>
                    <div className="text-secondary">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
