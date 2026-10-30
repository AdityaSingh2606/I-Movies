import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const result = await register(formData);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="container py-5 my-md-4" style={{ maxWidth: '520px' }}>
      <div className="glass-card p-4 p-md-5">
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-4 mb-3" style={{ background: 'var(--accent-gradient)' }}>
            <Film className="text-white" size={32} />
          </div>
          <h2 className="fw-bold text-white display-font mb-1">
            Create an <span className="glow-text">Account</span>
          </h2>
          <p className="text-secondary small">Join IMovies for fast ticket booking and cinema rewards</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mb-4">
          <div>
            <label className="form-label text-secondary small fw-semibold">Full Name</label>
            <div className="position-relative">
              <input
                type="text"
                name="name"
                className="form-control cinematic-input pe-5"
                placeholder="Aditya Singh"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <User size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                name="email"
                className="form-control cinematic-input pe-5"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Mail size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-secondary small fw-semibold">Phone Number</label>
            <div className="position-relative">
              <input
                type="tel"
                name="phone"
                className="form-control cinematic-input pe-5"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <Phone size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-secondary small fw-semibold">Password</label>
            <div className="position-relative">
              <input
                type="password"
                name="password"
                className="form-control cinematic-input pe-5"
                placeholder="•••••••• (Min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <Lock size={18} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div>
            <label className="form-label text-secondary small fw-semibold">Confirm Password</label>
            <div className="position-relative">
              <input
                type="password"
                name="confirmPassword"
                className="form-control cinematic-input pe-5"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-secondary small">
          Already registered on IMovies?{' '}
          <Link to="/login" className="text-info fw-semibold text-decoration-none">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
