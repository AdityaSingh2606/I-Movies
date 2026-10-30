import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  if (!isOpen || !trailerUrl) return null;

  // Format url for autoplay if embed
  let embedUrl = trailerUrl;
  if (trailerUrl.includes('watch?v=')) {
    const videoId = trailerUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (!trailerUrl.includes('autoplay=1')) {
    embedUrl = `${trailerUrl}?autoplay=1`;
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content bg-dark border-secondary rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-secondary py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
              <span className="glow-text">Official Trailer</span> – {movieTitle}
            </h5>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-circle p-2 text-white"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body p-0" style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={`${movieTitle} Official Trailer`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
