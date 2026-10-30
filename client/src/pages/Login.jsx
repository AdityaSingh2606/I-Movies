import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container py-5 my-md-4" style={{ maxWidth: '480px' }}>
      <div className="glass-card p-4 p-md-5">
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-4 mb-3" style={{ background: 'var(--accent-gradient)' }}>
            <Film className="text-white" size={32} />
          </div>
          <h2 className="fw-bold text-white display-font mb-1">
            Welcome to <span className="glow-text">IMovies</span>
          </h2>
          <p className="text-secondary small">Sign in to book cinema seats and access tickets</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mb-4">
          <div>
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                className="form-control cinematic-input pe-5"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-secondary small fw-semibold mb-0">Password</label>
            </div>
            <div className="position-relative">
              <input
                type="password"
                className="form-control cinematic-input pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <button
            type="submit"
            className="btn glow-btn btn-lg rounded-pill mt-2 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={submitting}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Fast Fill Buttons for College Evaluators */}
        <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4">
          <div className="text-secondary extra-small fw-bold text-uppercase mb-2 tracking-wider">
            Quick Fill Demo Credentials
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-info btn-sm rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 extra-small"
              onClick={() => handleFillDemo('user@imovies.com', 'User@123')}
            >
              <User size={13} />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-1 extra-small"
              onClick={() => handleFillDemo('admin@imovies.com', 'Admin@123')}
            >
              <Shield size={13} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-secondary small">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-info fw-semibold text-decoration-none">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
