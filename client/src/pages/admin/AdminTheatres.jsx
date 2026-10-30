import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Star, MapPin, Search } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const emptyTheatreForm = {
  name: '',
  brand: 'PVR Cinemas',
  city: 'Mumbai',
  location: '',
  address: '',
  totalScreens: 3,
  facilities: 'Dolby Atmos 7.1, 4K Projection, Recliner Seats, Food Court',
  image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
};

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyTheatreForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      const res = await api.get('/theatres');
      setTheatres(res.data.theatres || []);
    } catch (err) {
      toast.error('Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      totalScreens: Number(formData.totalScreens),
      facilities: formData.facilities.split(',').map((s) => s.trim()).filter(Boolean)
    };

    try {
      await api.post('/theatres', payload);
      toast.success('Theatre and screens created successfully');
      setModalOpen(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create theatre');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete theatre "${name}" and all associated screens?`)) return;

    try {
      await api.delete(`/theatres/${id}`);
      toast.success('Theatre deleted');
      setTheatres((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredTheatres = theatres.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Retrieving multiplex auditoriums..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-white display-font mb-1">Theatre Management</h2>
          <p className="text-secondary small mb-0">Register cinema complexes, configure screens, and manage venue amenities</p>
        </div>
        <button
          className="btn glow-btn rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          onClick={() => {
            setFormData(emptyTheatreForm);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add New Cinema</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
            placeholder="Search theatre name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
        </div>
      </div>

      {/* Theatres Table */}
      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-secondary extra-small text-uppercase">
              <tr>
                <th>Venue Image</th>
                <th>Theatre Name & Brand</th>
                <th>City & Location</th>
                <th>Screens</th>
                <th>Facilities</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTheatres.map((t) => (
                <tr key={t._id}>
                  <td style={{ width: '70px' }}>
                    <img
                      src={t.image}
                      alt={t.name}
                      className="rounded object-fit-cover shadow"
                      style={{ width: '60px', height: '45px' }}
                    />
                  </td>
                  <td>
                    <div className="fw-bold text-white small">{t.name}</div>
                    <span className="badge bg-primary bg-opacity-25 text-info extra-small">{t.brand}</span>
                  </td>
                  <td>
                    <div className="text-white small fw-semibold">{t.city}</div>
                    <div className="text-secondary extra-small">{t.location}</div>
                  </td>
                  <td>
                    <span className="badge bg-secondary px-2 py-1 extra-small">{t.totalScreens} Screens</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '280px' }}>
                      {t.facilities?.slice(0, 3).map((f) => (
                        <span key={f} className="badge bg-dark border border-secondary extra-small">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle p-2"
                      title="Delete Theatre"
                      onClick={() => handleDelete(t._id, t.name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Theatre Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border border-secondary rounded-4 shadow-lg text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">Add New Cinema Multiplex</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 row g-3">
                  <div className="col-md-8">
                    <label className="form-label text-secondary small fw-semibold">Cinema / Theatre Name</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. PVR ICON: Phoenix Mall"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Cinema Brand</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="PVR, INOX, IMAX"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">City</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Mumbai, Delhi-NCR"
                      required
                    />
                  </div>

                  <div className="col-md-5">
                    <label className="form-label text-secondary small fw-semibold">Location / Area</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Lower Parel, Whitefield"
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Total Screens</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control cinematic-input"
                      value={formData.totalScreens}
                      onChange={(e) => setFormData({ ...formData, totalScreens: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">Full Address</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full street address with postal code"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">Facilities (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.facilities}
                      onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">Image URL</label>
                    <input
                      type="url"
                      className="form-control cinematic-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary p-3">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn glow-btn rounded-pill px-4" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Cinema & Auto-Generate Screens'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatres;
