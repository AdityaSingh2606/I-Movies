import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Ticket,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import api from '../services/api';
import TrailerModal from '../components/common/TrailerModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { selectedCity } = useAuth();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Dates for next 5 days
  const availableDates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    availableDates.push({ dateStr, dayName, formatted });
  }

  useEffect(() => {
    setSelectedDate(availableDates[0].dateStr);
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const res = await api.get(`/movies/${id}`);
      setMovie(res.data.movie);
      setShows(res.data.shows || []);
    } catch (err) {
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading movie details and cinema showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Movie Not Found</h3>
        <Link to="/movies" className="btn glow-btn btn-sm rounded-pill mt-3">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Filter shows by selected date & city
  const filteredShows = shows.filter((s) => {
    const matchesDate = s.showDate === selectedDate;
    const matchesCity = !selectedCity || (s.theatre && s.theatre.city.toLowerCase() === selectedCity.toLowerCase());
    return matchesDate && matchesCity;
  });

  // Group filtered shows by Theatre
  const showsByTheatre = {};
  filteredShows.forEach((show) => {
    if (!show.theatre) return;
    const theatreId = show.theatre._id;
    if (!showsByTheatre[theatreId]) {
      showsByTheatre[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    showsByTheatre[theatreId].shows.push(show);
  });

  return (
    <div className="movie-details-page pb-5">
      {/* 1. CINEMATIC BACKDROP BANNER */}
      <section
        className="position-relative text-white"
        style={{
          background: `linear-gradient(180deg, rgba(8, 12, 21, 0.4) 0%, rgba(8, 12, 21, 0.9) 60%, #080c15 100%), url(${movie.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          paddingTop: '60px',
          paddingBottom: '60px'
        }}
      >
        <div className="container px-4 px-lg-5">
          <div className="row g-5 align-items-center">
            {/* Movie Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div className="rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-50 mx-auto" style={{ maxWidth: '280px' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            {/* Movie Header Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="badge bg-danger px-3 py-1 rounded-pill">{movie.status}</span>
                <span className="badge bg-secondary px-3 py-1 rounded-pill">{movie.certification}</span>
                <span className="text-secondary small d-flex align-items-center gap-1">
                  <Clock size={14} />
                  {movie.duration} Minutes
                </span>
                <span className="text-secondary small">•</span>
                <span className="text-secondary small">
                  Released: {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="display-4 fw-bold text-white mb-2">{movie.title}</h1>
              <p className="text-info fw-semibold mb-3">{movie.genre?.join(' • ')}</p>

              {/* Rating Box */}
              <div className="glass-card p-3 mb-4 d-inline-flex align-items-center gap-4 bg-dark bg-opacity-50">
                <div className="d-flex align-items-center gap-2">
                  <Star size={24} className="text-warning fill-warning" />
                  <div>
                    <span className="fs-4 fw-bold text-white">{movie.rating.toFixed(1)}</span>
                    <span className="text-secondary small"> / 10</span>
                  </div>
                </div>
                <div className="border-start border-secondary border-opacity-50 ps-4">
                  <div className="text-white small fw-semibold">{movie.voteCount?.toLocaleString()} Votes</div>
                  <div className="text-muted extra-small">Audience Score</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3">
                {movie.status === 'Now Showing' ? (
                  <a href="#showtimes-section" className="btn glow-btn btn-lg rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                    <Ticket size={20} />
                    <span>Select Show & Book</span>
                  </a>
                ) : (
                  <button className="btn btn-secondary btn-lg rounded-pill px-4 py-2" disabled>
                    Coming Soon - Bookings Open Soon
                  </button>
                )}

                <button
                  className="btn glow-btn-outline btn-lg rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <Play size={20} className="fill-white" />
                  <span>Watch Trailer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYNOPSIS & CAST SECTION */}
      <section className="container px-4 px-lg-5 my-5">
        <div className="row g-5">
          <div className="col-lg-8">
            <h4 className="fw-bold text-white display-font mb-3">About the Movie</h4>
            <p className="text-light text-opacity-80 lead fs-6 lh-base mb-4">
              {movie.description}
            </p>

            <div className="mb-4">
              <span className="text-secondary small fw-semibold">Directed by: </span>
              <span className="text-white fw-bold ms-1">{movie.director}</span>
            </div>

            <div className="mb-4">
              <span className="text-secondary small fw-semibold">Languages Available: </span>
              <span className="text-info fw-semibold ms-1">{movie.language?.join(', ')}</span>
            </div>

            {/* Cast Cards */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mt-4">
                <h5 className="fw-bold text-white display-font mb-3">Featured Cast</h5>
                <div className="row row-cols-3 row-cols-md-4 g-3">
                  {movie.cast.map((actor, idx) => (
                    <div key={idx} className="col">
                      <div className="glass-card p-3 text-center h-100">
                        <img
                          src={actor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={actor.name}
                          className="rounded-circle mb-2 mx-auto"
                          style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-white small text-truncate">{actor.name}</div>
                        <div className="text-secondary extra-small text-truncate" style={{ fontSize: '11px' }}>
                          {actor.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Specs Sidebar */}
          <div className="col-lg-4">
            <div className="glass-card p-4">
              <h5 className="fw-bold text-white mb-3">Cinema Experience</h5>
              <ul className="list-unstyled text-secondary small d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded bg-primary bg-opacity-25 text-info">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-white fw-semibold">Runtime Duration</div>
                    <div>{movie.duration} minutes of cinematic spectacle</div>
                  </div>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded bg-success bg-opacity-25 text-success">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-white fw-semibold">Theatrical Release</div>
                    <div>{new Date(movie.releaseDate).toDateString()}</div>
                  </div>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded bg-warning bg-opacity-25 text-warning">
                    <Info size={16} />
                  </div>
                  <div>
                    <div className="text-white fw-semibold">Certification</div>
                    <div>Rated {movie.certification} - Suitable for general audiences</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRES SECTION */}
      {movie.status === 'Now Showing' && (
        <section id="showtimes-section" className="container px-4 px-lg-5 my-5 pt-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h3 className="fw-bold text-white display-font mb-1">
                Select <span className="glow-text">Showtimes</span> in {selectedCity}
              </h3>
              <p className="text-secondary small mb-0">Select your preferred date, cinema, and time to book seats</p>
            </div>
          </div>

          {/* Date Picker Pills */}
          <div className="d-flex gap-2 overflow-auto pb-3 mb-4">
            {availableDates.map((item) => (
              <button
                key={item.dateStr}
                className={`btn rounded-4 px-4 py-2 d-flex flex-column align-items-center flex-shrink-0 transition-all ${
                  selectedDate === item.dateStr
                    ? 'btn-info text-dark fw-bold shadow-lg'
                    : 'btn-dark text-secondary border border-secondary border-opacity-25'
                }`}
                onClick={() => setSelectedDate(item.dateStr)}
              >
                <span className="small text-uppercase">{item.dayName}</span>
                <span className="fs-5 fw-bold">{item.formatted}</span>
              </button>
            ))}
          </div>

          {/* Theatre Showtimes Cards */}
          {Object.keys(showsByTheatre).length === 0 ? (
            <div className="glass-card p-5 text-center text-muted">
              <h5 className="text-white mb-2">No Shows Scheduled for {selectedDate} in {selectedCity}</h5>
              <p className="text-secondary small">Please select a different date or city above to check showtime availability.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
                <div key={theatre._id} className="glass-card p-4">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-25 gap-2">
                    <div>
                      <h5 className="fw-bold text-white mb-1">{theatre.name}</h5>
                      <p className="text-secondary small mb-0 d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-info" />
                        <span>{theatre.location}, {theatre.city}</span>
                      </p>
                    </div>

                    <div className="d-flex flex-wrap gap-1">
                      {theatre.facilities?.slice(0, 3).map((f) => (
                        <span key={f} className="badge bg-dark border border-secondary border-opacity-50 text-secondary extra-small" style={{ fontSize: '11px' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills Grid */}
                  <div className="d-flex flex-wrap gap-3">
                    {tShows.map((show) => (
                      <Link
                        key={show._id}
                        to={`/book/${show._id}`}
                        className="btn btn-outline-info rounded-3 px-3 py-2 text-start transition-all hover-glow"
                        style={{ minWidth: '135px' }}
                      >
                        <div className="fw-bold text-white fs-6">{show.showTime}</div>
                        <div className="extra-small text-info mt-1 d-flex align-items-center justify-content-between" style={{ fontSize: '11px' }}>
                          <span>{show.screen?.screenType || 'IMAX 3D'}</span>
                          <span className={`badge ${show.status === 'Filling Fast' ? 'bg-warning text-dark' : 'bg-dark text-secondary'}`}>
                            {show.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetails;
