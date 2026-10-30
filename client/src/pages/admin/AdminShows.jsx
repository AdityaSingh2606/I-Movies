import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, Film, Building2, Trash2, Ban } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatreScreens, setSelectedTheatreScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTime, setShowTime] = useState('06:30 PM');
  const [prices, setPrices] = useState({ silver: 180, gold: 250, platinum: 350 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies'),
        api.get('/theatres')
      ]);

      setShows(showsRes.data.shows || []);
      setMovies(moviesRes.data.movies || []);
      setTheatres(theatresRes.data.theatres || []);

      if (moviesRes.data.movies?.length > 0) {
        setSelectedMovie(moviesRes.data.movies[0]._id);
      }
      if (theatresRes.data.theatres?.length > 0) {
        setSelectedTheatre(theatresRes.data.theatres[0]._id);
        fetchTheatreScreens(theatresRes.data.theatres[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load show configuration data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTheatreScreens = async (theatreId) => {
    try {
      const res = await api.get(`/theatres/${theatreId}`);
      setSelectedTheatreScreens(res.data.screens || []);
      if (res.data.screens?.length > 0) {
        setSelectedScreen(res.data.screens[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTheatreChange = (e) => {
    const theatreId = e.target.value;
    setSelectedTheatre(theatreId);
    fetchTheatreScreens(theatreId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/shows', {
        movie: selectedMovie,
        theatre: selectedTheatre,
        screen: selectedScreen,
        showDate,
        showTime,
        ticketPrices: {
          silver: Number(prices.silver),
          gold: Number(prices.gold),
          platinum: Number(prices.platinum)
        }
      });

      toast.success('Auditorium show scheduled successfully');
      setModalOpen(false);
      // Refresh shows
      const showsRes = await api.get('/shows');
      setShows(showsRes.data.shows || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelShow = async (showId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled show?')) return;

    try {
      await api.delete(`/shows/${showId}`);
      toast.success('Show cancelled');
      setShows((prev) =>
        prev.map((s) => (s._id === showId ? { ...s, status: 'Cancelled' } : s))
      );
    } catch (err) {
      toast.error('Cancel failed');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading auditorium show schedules..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-white display-font mb-1">Show Scheduling</h2>
          <p className="text-secondary small mb-0">Schedule screenings, configure screen formats, and set category pricing</p>
        </div>
        <button
          className="btn glow-btn rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          <span>Schedule New Show</span>
        </button>
      </div>

      {/* Shows Table */}
      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-secondary extra-small text-uppercase">
              <tr>
                <th>Movie</th>
                <th>Theatre & Screen</th>
                <th>Date & Time</th>
                <th>Pricing Structure</th>
                <th>Capacity / Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={s.movie?.posterUrl}
                        alt={s.movie?.title}
                        className="rounded object-fit-cover shadow"
                        style={{ width: '38px', height: '50px' }}
                      />
                      <div>
                        <div className="fw-bold text-white small">{s.movie?.title}</div>
                        <div className="text-muted extra-small">{s.movie?.duration} Mins</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-white small fw-semibold">{s.theatre?.name}</div>
                    <div className="text-info extra-small">{s.screen?.name || 'Audi 1'} ({s.theatre?.city})</div>
                  </td>
                  <td>
                    <div className="text-white small fw-semibold">{s.showDate}</div>
                    <div className="text-secondary extra-small">{s.showTime}</div>
                  </td>
                  <td>
                    <div className="extra-small d-flex flex-column gap-1">
                      <span className="text-secondary">Silver: <strong className="text-light">₹{s.ticketPrices?.silver}</strong></span>
                      <span className="text-secondary">Gold: <strong className="text-warning">₹{s.ticketPrices?.gold}</strong></span>
                      <span className="text-secondary">Platinum: <strong className="text-info">₹{s.ticketPrices?.platinum}</strong></span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'Cancelled' ? 'bg-danger' : 'bg-primary'} px-2 py-1 rounded-pill extra-small`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {s.status !== 'Cancelled' && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                        title="Cancel Show"
                        onClick={() => handleCancelShow(s._id)}
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Show Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark border border-secondary rounded-4 shadow-lg text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">Schedule Auditorium Screening</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Select Movie</label>
                    <select
                      className="form-select cinematic-input"
                      value={selectedMovie}
                      onChange={(e) => setSelectedMovie(e.target.value)}
                      required
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Select Cinema Venue</label>
                    <select
                      className="form-select cinematic-input"
                      value={selectedTheatre}
                      onChange={handleTheatreChange}
                      required
                    >
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Select Screen</label>
                    <select
                      className="form-select cinematic-input"
                      value={selectedScreen}
                      onChange={(e) => setSelectedScreen(e.target.value)}
                      required
                    >
                      {selectedTheatreScreens.map((sc) => (
                        <option key={sc._id} value={sc._id}>{sc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Show Date</label>
                    <input
                      type="date"
                      className="form-control cinematic-input"
                      value={showDate}
                      onChange={(e) => setShowDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Show Time</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={showTime}
                      onChange={(e) => setShowTime(e.target.value)}
                      placeholder="e.g. 06:45 PM"
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="fw-bold text-info mb-2">Category Pricing Matrix (₹)</h6>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Silver Tier (Rows A-B)</label>
                    <input
                      type="number"
                      className="form-control cinematic-input"
                      value={prices.silver}
                      onChange={(e) => setPrices({ ...prices, silver: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Gold Tier (Rows C-E)</label>
                    <input
                      type="number"
                      className="form-control cinematic-input"
                      value={prices.gold}
                      onChange={(e) => setPrices({ ...prices, gold: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Platinum Tier (Row F)</label>
                    <input
                      type="number"
                      className="form-control cinematic-input"
                      value={prices.platinum}
                      onChange={(e) => setPrices({ ...prices, platinum: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary p-3">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn glow-btn rounded-pill px-4" disabled={submitting}>
                    {submitting ? 'Generating Show & Seat Grid...' : 'Confirm Show Schedule'}
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

export default AdminShows;
