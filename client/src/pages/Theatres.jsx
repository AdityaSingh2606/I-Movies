import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Star, Film, Sparkles, Search } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CITIES = ['All', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai'];

const Theatres = () => {
  const { selectedCity, setSelectedCity } = useAuth();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCityTab, setActiveCityTab] = useState(selectedCity || 'All');

  useEffect(() => {
    fetchTheatres();
  }, [activeCityTab]);

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCityTab !== 'All') params.city = activeCityTab;
      const res = await api.get('/theatres', { params });
      setTheatres(res.data.theatres || []);
    } catch (err) {
      console.error('Error fetching theatres:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTheatres = theatres.filter((t) => {
    if (!searchTerm) return true;
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold text-white display-font mb-2">
          Cinemas & <span className="glow-text">Multiplexes</span>
        </h1>
        <p className="text-secondary small">
          Explore world-class theatres featuring IMAX Laser, Dolby Atmos, and luxury recliner lounges
        </p>
      </div>

      {/* Filter and City Tabs */}
      <div className="glass-card p-4 mb-5">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-2 overflow-auto pb-2 pb-lg-0">
              <span className="text-secondary fw-semibold small me-2 flex-shrink-0">City:</span>
              {CITIES.map((city) => (
                <button
                  key={city}
                  className={`btn btn-sm rounded-pill px-3 py-1 flex-shrink-0 ${
                    activeCityTab === city
                      ? 'btn-info text-dark fw-bold'
                      : 'btn-dark text-secondary border border-secondary border-opacity-25'
                  }`}
                  onClick={() => {
                    setActiveCityTab(city);
                    if (city !== 'All') setSelectedCity(city);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
                placeholder="Search by theatre name, mall, area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Theatres List */}
      {loading ? (
        <LoadingSpinner message="Finding premium cinema locations..." />
      ) : filteredTheatres.length === 0 ? (
        <div className="glass-card p-5 text-center text-muted">
          <h4 className="text-white fw-bold mb-2">No Cinemas Found</h4>
          <p className="text-secondary small">Try changing the city or search terms.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTheatres.map((theatre) => (
            <div key={theatre._id} className="col-lg-6">
              <div className="glass-card h-100 overflow-hidden d-flex flex-column flex-sm-row">
                <div className="flex-shrink-0 position-relative" style={{ minWidth: '220px', height: '180px' }}>
                  <img
                    src={theatre.image}
                    alt={theatre.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-dark text-warning border border-warning px-2 py-1 d-flex align-items-center gap-1">
                      <Star size={12} className="fill-warning" />
                      {theatre.rating}
                    </span>
                  </div>
                </div>

                <div className="p-4 d-flex flex-column justify-content-between flex-grow-1">
                  <div>
                    <div className="text-info extra-small fw-bold text-uppercase mb-1 tracking-wider">
                      {theatre.brand}
                    </div>
                    <h5 className="fw-bold text-white mb-2">{theatre.name}</h5>
                    <p className="text-secondary small mb-3 d-flex align-items-start gap-1">
                      <MapPin size={14} className="text-info mt-1 flex-shrink-0" />
                      <span>{theatre.address}</span>
                    </p>
                  </div>

                  <div>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {theatre.facilities?.slice(0, 3).map((f) => (
                        <span key={f} className="badge bg-dark border border-secondary border-opacity-50 text-secondary extra-small" style={{ fontSize: '10px' }}>
                          {f}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/movies`}
                      className="btn glow-btn btn-sm rounded-pill px-4 py-1 d-inline-flex align-items-center gap-2"
                    >
                      <Film size={14} />
                      <span>Browse Shows</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Theatres;
