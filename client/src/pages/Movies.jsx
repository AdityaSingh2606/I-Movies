import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/movie/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Comedy', 'Animation', 'Biography', 'Crime'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];
const STATUSES = ['All', 'Now Showing', 'Coming Soon'];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States from URL or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState('rating_desc');

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, selectedStatus, sortBy, searchParams]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {};
      const urlSearch = searchParams.get('search');
      if (urlSearch) params.search = urlSearch;
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/movies', { params });
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedStatus('All');
    setSortBy('rating_desc');
    setSearchParams({});
  };

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="fw-bold text-white display-font mb-2">
          Explore <span className="glow-text">Movies</span>
        </h1>
        <p className="text-secondary small">
          Discover currently playing films and upcoming releases in premier cinemas
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 mb-5">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-lg-4">
            <div className="position-relative">
              <input
                type="text"
                className="form-control cinematic-input pe-5 rounded-pill"
                placeholder="Search by title, director, cast..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn position-absolute end-0 top-50 translate-middle-y text-secondary pe-3 border-0"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select cinematic-input rounded-pill"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="All">All Genres</option>
              {GENRES.filter((g) => g !== 'All').map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select cinematic-input rounded-pill"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="All">All Languages</option>
              {LANGUAGES.filter((l) => l !== 'All').map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select cinematic-input rounded-pill"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Now Showing">Now Showing</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="col-6 col-md-3 col-lg-2">
            <select
              className="form-select cinematic-input rounded-pill"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating_desc">Top Rated</option>
              <option value="release_desc">Newest Releases</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </form>

        {/* Active Filter Pills Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 mt-3 border-top border-secondary border-opacity-25 extra-small">
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary fw-semibold">Quick Genre:</span>
            {GENRES.slice(0, 6).map((g) => (
              <button
                key={g}
                className={`btn btn-sm py-0 px-2 rounded-pill ${
                  selectedGenre === g
                    ? 'btn-info text-dark fw-bold'
                    : 'btn-outline-secondary border-opacity-50 text-secondary'
                }`}
                style={{ fontSize: '11px' }}
                onClick={() => setSelectedGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {(selectedGenre !== 'All' || selectedLanguage !== 'All' || selectedStatus !== 'All' || searchTerm) && (
            <button
              className="btn btn-link text-info text-decoration-none p-0 d-flex align-items-center gap-1 extra-small"
              onClick={handleResetFilters}
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering cinematic listings..." />
      ) : movies.length === 0 ? (
        <div className="glass-card p-5 text-center text-muted">
          <h4 className="text-white fw-bold mb-2">No Movies Found</h4>
          <p className="text-secondary small mb-3">Try clearing search terms or modifying genre and language filters.</p>
          <button className="btn glow-btn btn-sm rounded-pill px-4" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;
