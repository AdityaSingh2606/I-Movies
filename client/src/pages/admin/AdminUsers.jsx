import React, { useState, useEffect } from 'react';
import { Users, Shield, User, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole.toUpperCase()}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/toggle-status`);
      toast.success(res.data.message);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.user.isActive } : u))
      );
    } catch (err) {
      toast.error('Status toggle failed');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Querying customer profile directory..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-white display-font mb-1">User Management</h2>
        <p className="text-secondary small">Directory of registered patrons, role administration, and access privileges</p>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-secondary extra-small text-uppercase">
              <tr>
                <th>Profile</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Total Bookings</th>
                <th>Account Status</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={u.name}
                        className="rounded-circle object-fit-cover shadow"
                        style={{ width: '36px', height: '36px' }}
                      />
                      <span className="fw-bold text-white small">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-white small">{u.email}</div>
                    <div className="text-muted extra-small">{u.phone}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-2 py-1 rounded-pill extra-small`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="text-info fw-bold small">{u.bookingCount || 0} Tickets</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'} px-2 py-1 rounded-pill extra-small`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="text-secondary extra-small">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        className="btn btn-outline-warning btn-sm rounded-pill px-3 py-1 extra-small"
                        onClick={() => handleToggleRole(u._id, u.role)}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                      <button
                        className={`btn ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'} btn-sm rounded-pill px-3 py-1 extra-small`}
                        onClick={() => handleToggleStatus(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
