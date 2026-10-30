import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Play, Ticket } from 'lucide-react';
import TrailerModal from '../common/TrailerModal';

const MovieCard = ({ movie }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <>
      <div className="movie-card h-100 d-flex flex-column">
        {/* Poster Wrapper */}
        <div className="movie-poster-wrap">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Top Rating Badge */}
          <div className="position-absolute top-0 start-0 m-2 z-2">
            <span className="badge bg-dark bg-opacity-75 text-warning border border-warning border-opacity-50 px-2 py-1 d-flex align-items-center gap-1 rounded-pill">
              <Star size={13} className="fill-warning" />
              <span className="fw-bold">{movie.rating.toFixed(1)}</span>
            </span>
          </div>

          {/* Certification Badge */}
          <div className="position-absolute top-0 end-0 m-2 z-2">
            <span className="badge bg-primary bg-opacity-75 text-white border border-light border-opacity-25 px-2 py-1 rounded-pill">
              {movie.certification || 'UA'}
            </span>
          </div>

          {/* Quick Trailer Play Button overlay */}
          <div className="movie-overlay">
            <button
              className="btn btn-outline-light btn-sm rounded-pill mb-2 d-flex align-items-center justify-content-center gap-2 glow-btn-outline"
              onClick={() => setShowTrailer(true)}
            >
              <Play size={14} className="fill-white" />
              <span>Watch Trailer</span>
            </button>
            <Link
              to={`/movies/${movie._id}`}
              className="btn glow-btn btn-sm rounded-pill d-flex align-items-center justify-content-center gap-2"
            >
              <Ticket size={14} />
              <span>{movie.status === 'Now Showing' ? 'Book Tickets' : 'View Details'}</span>
            </Link>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-3 d-flex flex-column flex-grow-1 bg-secondary bg-opacity-25">
          <Link to={`/movies/${movie._id}`} className="text-white text-decoration-none">
            <h6 className="fw-bold text-truncate mb-1 hover-info" title={movie.title}>
              {movie.title}
            </h6>
          </Link>

          <div className="d-flex align-items-center gap-2 text-secondary extra-small mb-2" style={{ fontSize: '12px' }}>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} />
              {movie.duration}m
            </span>
            <span>•</span>
            <span className="text-truncate">{movie.language?.join(', ')}</span>
          </div>

          {/* Genre Badges */}
          <div className="d-flex flex-wrap gap-1 mt-auto">
            {movie.genre?.slice(0, 2).map((g) => (
              <span
                key={g}
                className="badge bg-dark border border-secondary border-opacity-50 text-secondary extra-small"
                style={{ fontSize: '10px' }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </>
  );
};

export default MovieCard;
