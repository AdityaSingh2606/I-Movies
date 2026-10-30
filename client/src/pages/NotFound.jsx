import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container py-5 my-5 text-center">
      <div className="d-inline-flex p-4 rounded-circle bg-secondary bg-opacity-25 text-info mb-4">
        <Film size={64} />
      </div>
      <h1 className="display-1 fw-bold text-white display-font mb-2">404</h1>
      <h3 className="text-white fw-bold mb-3">Scene Not Found</h3>
      <p className="text-secondary small col-md-6 mx-auto mb-4">
        The cinematic feature you are looking for does not exist or may have completed its theatrical run.
      </p>
      <Link to="/" className="btn glow-btn rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2">
        <Home size={18} />
        <span>Return to Box Office</span>
      </Link>
    </div>
  );
};

export default NotFound;
