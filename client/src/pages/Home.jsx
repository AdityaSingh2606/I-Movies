import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/movie/MovieCard';
import TrailerModal from '../components/common/TrailerModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Comedy', 'Animation'];

const Home = () => {
  const { selectedCity } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        api.get('/movies'),
        api.get('/theatres')
      ]);

      const allMovies = moviesRes.data.movies || [];
      const showing = allMovies.filter((m) => m.status === 'Now Showing');
      const coming = allMovies.filter((m) => m.status === 'Coming Soon');

      setNowShowing(showing);
      setComingSoon(coming);
      setFeaturedMovies(showing.slice(0, 3));
      setTheatres(theatresRes.data.theatres || []);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = featuredMovies[activeHeroIdx] || nowShowing[0];

  const filteredNowShowing =
    selectedGenre === 'All'
      ? nowShowing
      : nowShowing.filter((m) => m.genre?.includes(selectedGenre));

  if (loading) {
    return <LoadingSpinner message="Curating today's cinema experience..." />;
  }

  return (
    <div className="home-page pb-5">
      {/* 1. CINEMATIC HERO SPOTLIGHT */}
      {heroMovie && (
        <section
          className="position-relative hero-banner text-white overflow-hidden"
          style={{
            minHeight: '680px',
            background: `linear-gradient(180deg, rgba(8, 12, 21, 0.4) 0%, rgba(8, 12, 21, 0.85) 70%, #080c15 100%), url(${heroMovie.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }}
        >
          <div className="container px-4 px-lg-5 h-100 d-flex flex-column justify-content-end pb-5 pt-5" style={{ minHeight: '680px' }}>
            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                {/* Spotlight Badge */}
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-25 border border-primary border-opacity-50 text-info small mb-3">
                  <Sparkles size={14} />
                  <span className="fw-semibold">NOW STREAMING ON BIG SCREENS</span>
                </div>

                <h1 className="display-3 fw-bold text-white mb-2">{heroMovie.title}</h1>

                {/* Metadata Row */}
                <div className="d-flex flex-wrap align-items-center gap-3 text-light mb-3">
                  <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1 px-2 py-1">
                    <Star size={14} className="fill-dark" />
                    <span>{heroMovie.rating.toFixed(1)} / 10</span>
                  </span>
                  <span className="badge bg-secondary">{heroMovie.certification}</span>
                  <span className="d-flex align-items-center gap-1 text-secondary small">
                    <Clock size={14} />
                    {heroMovie.duration} Mins
                  </span>
                  <span className="text-secondary small">•</span>
                  <span className="text-secondary small">{heroMovie.language?.join(', ')}</span>
                  <span className="text-secondary small">•</span>
                  <span className="text-info small fw-semibold">{heroMovie.genre?.join(', ')}</span>
                </div>

                <p className="lead text-light text-opacity-90 col-xl-10 mb-4 fs-6" style={{ maxHeight: '75px', overflow: 'hidden' }}>
                  {heroMovie.description}
                </p>

                {/* Hero CTAs */}
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <Link
                    to={`/movies/${heroMovie._id}`}
                    className="btn glow-btn btn-lg rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                  >
                    <Ticket size={20} />
                    <span>Book Tickets</span>
                  </Link>

                  <button
                    className="btn glow-btn-outline btn-lg rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                    onClick={() => setShowTrailer(true)}
                  >
                    <Play size={20} className="fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                </div>
              </div>

              {/* Spotlight Carousel Indicators */}
              <div className="col-lg-4 d-flex justify-content-lg-end">
                <div className="d-flex gap-2">
                  {featuredMovies.map((m, idx) => (
                    <button
                      key={m._id}
                      onClick={() => setActiveHeroIdx(idx)}
                      className={`btn p-0 rounded-3 overflow-hidden border-2 transition-all ${
                        activeHeroIdx === idx ? 'border border-info shadow-lg' : 'opacity-50'
                      }`}
                      style={{ width: '70px', height: '95px' }}
                    >
                      <img src={m.posterUrl} alt={m.title} className="w-100 h-100 object-fit-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. GENRE QUICK FILTER BAR */}
      <div className="container px-4 px-lg-5 my-4">
        <div className="d-flex align-items-center gap-2 overflow-auto py-2">
          <span className="text-secondary fw-semibold small me-2 flex-shrink-0">Browse by Genre:</span>
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`btn btn-sm rounded-pill px-3 py-1 flex-shrink-0 ${
                selectedGenre === genre
                  ? 'btn-info text-dark fw-bold'
                  : 'btn-dark text-secondary border border-secondary border-opacity-25'
              }`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 3. NOW SHOWING SECTION */}
      <section className="container px-4 px-lg-5 my-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="text-white fw-bold display-font mb-1">
              Now <span className="glow-text">Showing</span> in {selectedCity}
            </h2>
            <p className="text-secondary small mb-0">Experience the latest blockbusters on premium screens</p>
          </div>
          <Link to="/movies?status=Now Showing" className="btn btn-outline-secondary btn-sm rounded-pill text-white d-flex align-items-center gap-1">
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {filteredNowShowing.length === 0 ? (
          <div className="glass-card p-5 text-center text-muted">
            No movies currently showing in this genre.
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {filteredNowShowing.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. COMING SOON SECTION */}
      {comingSoon.length > 0 && (
        <section className="container px-4 px-lg-5 my-5 pt-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="text-white fw-bold display-font mb-1">
                Coming <span className="text-info">Soon</span>
              </h2>
              <p className="text-secondary small mb-0">Anticipated releases hitting cinemas soon</p>
            </div>
            <Link to="/movies?status=Coming Soon" className="btn btn-outline-secondary btn-sm rounded-pill text-white d-flex align-items-center gap-1">
              <span>Explore All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. POPULAR THEATRES SHOWCASE */}
      <section className="container px-4 px-lg-5 my-5 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="text-white fw-bold display-font mb-1">
              Top <span className="glow-text">Theatres & Multiplexes</span>
            </h2>
            <p className="text-secondary small mb-0">Ultra-modern screens equipped with Dolby Atmos and Laser projection</p>
          </div>
          <Link to="/theatres" className="btn btn-outline-secondary btn-sm rounded-pill text-white d-flex align-items-center gap-1">
            <span>All Cinemas</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="row g-4">
          {theatres.slice(0, 3).map((theatre) => (
            <div key={theatre._id} className="col-md-4">
              <div className="glass-card h-100 overflow-hidden d-flex flex-column">
                <div style={{ height: '170px', position: 'relative' }}>
                  <img
                    src={theatre.image}
                    alt={theatre.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-dark text-warning border border-warning px-2 py-1 d-flex align-items-center gap-1">
                      <Star size={12} className="fill-warning" />
                      {theatre.rating}
                    </span>
                  </div>
                </div>
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <h6 className="fw-bold text-white mb-1">{theatre.name}</h6>
                  <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-info flex-shrink-0" />
                    <span>{theatre.location}, {theatre.city}</span>
                  </p>
                  <div className="d-flex flex-wrap gap-1 mt-auto pt-2">
                    {theatre.facilities?.slice(0, 3).map((f) => (
                      <span key={f} className="badge bg-dark border border-secondary border-opacity-50 text-muted extra-small" style={{ fontSize: '10px' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero Trailer Modal */}
      {heroMovie && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          trailerUrl={heroMovie.trailerUrl}
          movieTitle={heroMovie.title}
        />
      )}
    </div>
  );
};

export default Home;
