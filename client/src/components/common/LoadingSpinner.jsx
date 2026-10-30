import React from 'react';
import { Film } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
      <div className="position-relative mb-3">
        <Film className="text-info spin-slow" size={48} />
        <div
          className="spinner-border text-primary position-absolute top-50 start-50 translate-middle"
          style={{ width: '64px', height: '64px', borderWidth: '3px' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-secondary fw-semibold mt-2">{message}</p>
      <style>{`
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
