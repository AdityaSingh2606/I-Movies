import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit2, Trash2, Star, Clock, ExternalLink, Search } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const emptyMovieForm = {
  title: '',
  posterUrl: '',
  bannerUrl: '',
  description: '',
  genre: 'Action, Sci-Fi',
  language: 'English, Hindi',
  duration: 150,
  releaseDate: new Date().toISOString().split('T')[0],
  director: '',
  rating: 8.5,
  certification: 'UA',
  trailerUrl: '',
  status: 'Now Showing'
};

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [formData, setFormData] = useState(emptyMovieForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMovieId(null);
    setFormData(emptyMovieForm);
    setModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovieId(movie._id);
    setFormData({
      title: movie.title,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      description: movie.description,
      genre: movie.genre?.join(', ') || 'Action',
      language: movie.language?.join(', ') || 'English',
      duration: movie.duration,
      releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
      director: movie.director,
      rating: movie.rating,
      certification: movie.certification,
      trailerUrl: movie.trailerUrl,
      status: movie.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      genre: formData.genre.split(',').map((s) => s.trim()).filter(Boolean),
      language: formData.language.split(',').map((s) => s.trim()).filter(Boolean),
      duration: Number(formData.duration),
      rating: Number(formData.rating)
    };

    try {
      if (editingMovieId) {
        await api.put(`/movies/${editingMovieId}`, payload);
        toast.success('Movie updated successfully');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie added to catalogue');
      }
      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/movies/${id}`);
      toast.success('Movie deleted successfully');
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.director.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading movie database..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-white display-font mb-1">Movie Management</h2>
          <p className="text-secondary small mb-0">Add, edit, or remove titles and configure release statuses</p>
        </div>
        <button
          className="btn glow-btn rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
            placeholder="Search movie title, director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
        </div>
      </div>

      {/* Movies Table */}
      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-secondary extra-small text-uppercase">
              <tr>
                <th>Poster</th>
                <th>Title & Details</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Duration</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((m) => (
                <tr key={m._id}>
                  <td style={{ width: '60px' }}>
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="rounded object-fit-cover shadow"
                      style={{ width: '45px', height: '60px' }}
                    />
                  </td>
                  <td>
                    <div className="fw-bold text-white small">{m.title}</div>
                    <div className="text-muted extra-small">Dir: {m.director} • {m.certification}</div>
                    <div className="text-secondary extra-small">{m.language?.join(', ')}</div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {m.genre?.slice(0, 2).map((g) => (
                        <span key={g} className="badge bg-dark border border-secondary extra-small">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-dark text-warning border border-warning extra-small d-inline-flex align-items-center gap-1">
                      <Star size={12} className="fill-warning" />
                      {m.rating}
                    </span>
                  </td>
                  <td className="text-secondary small">{m.duration} Mins</td>
                  <td>
                    <span className={`badge ${m.status === 'Now Showing' ? 'bg-success' : 'bg-info text-dark'} px-2 py-1 rounded-pill extra-small`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        className="btn btn-outline-info btn-sm rounded-circle p-2"
                        title="Edit Movie"
                        onClick={() => handleOpenEditModal(m)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                        title="Delete Movie"
                        onClick={() => handleDelete(m._id, m.title)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border border-secondary rounded-4 shadow-lg text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">
                  {editingMovieId ? 'Edit Movie Details' : 'Add New Movie to Catalogue'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOpen(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 row g-3">
                  <div className="col-md-8">
                    <label className="form-label text-secondary small fw-semibold">Movie Title</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Release Status</label>
                    <select
                      className="form-select cinematic-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Now Showing">Now Showing</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Poster Image URL</label>
                    <input
                      type="url"
                      className="form-control cinematic-input"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Banner / Backdrop Image URL</label>
                    <input
                      type="url"
                      className="form-control cinematic-input"
                      value={formData.bannerUrl}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">Description / Synopsis</label>
                    <textarea
                      rows="3"
                      className="form-control cinematic-input"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Genres (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="Sci-Fi, Action, Drama"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Languages (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="English, Hindi, Telugu"
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control cinematic-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Audience Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control cinematic-input"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Certification</label>
                    <select
                      className="form-select cinematic-input"
                      value={formData.certification}
                      onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    >
                      <option value="U">U (Universal)</option>
                      <option value="UA">UA (Parental Guidance)</option>
                      <option value="A">A (Adults Only)</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-secondary small fw-semibold">Release Date</label>
                    <input
                      type="date"
                      className="form-control cinematic-input"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Director Name</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">YouTube Trailer URL</label>
                    <input
                      type="url"
                      className="form-control cinematic-input"
                      value={formData.trailerUrl}
                      onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/..."
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn glow-btn rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingMovieId ? 'Update Movie' : 'Create Movie'}
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

export default AdminMovies;
