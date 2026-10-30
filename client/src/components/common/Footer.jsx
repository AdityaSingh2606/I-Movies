import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, Zap, Sparkles, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-top border-secondary border-opacity-25 mt-5 pt-5 pb-4" style={{ backgroundColor: '#060911' }}>
      <div className="container px-4">
        {/* Cinema Perks Bar */}
        <div className="row g-4 mb-5 pb-5 border-bottom border-secondary border-opacity-25 text-center text-md-start">
          <div className="col-md-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-info">
                <Sparkles size={24} />
              </div>
              <div>
                <h6 className="fw-bold text-white mb-1">Dolby Atmos Sound</h6>
                <small className="text-secondary">Immersive 3D audio experience</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="p-3 rounded-circle bg-info bg-opacity-10 text-info">
                <Zap size={24} />
              </div>
              <div>
                <h6 className="fw-bold text-white mb-1">Instant M-Tickets</h6>
                <small className="text-secondary">QR code entry, zero paperwork</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h6 className="fw-bold text-white mb-1">100% Secure Checkout</h6>
                <small className="text-secondary">Simulated gateway with demo mode</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning">
                <Smartphone size={24} />
              </div>
              <div>
                <h6 className="fw-bold text-white mb-1">Live Seat Lock</h6>
                <small className="text-secondary">Powered by real-time Socket.IO</small>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="row g-4 mb-4">
          <div className="col-lg-4">
            <Link to="/" className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 rounded-3" style={{ background: 'var(--accent-gradient)' }}>
                <Film className="text-white" size={20} />
              </div>
              <span className="fs-4 fw-bold text-white display-font">
                I<span className="glow-text">MOVIES</span>
              </span>
            </Link>
            <p className="text-secondary small pe-lg-4">
              IMovies is a premier cinema management and movie ticket booking platform delivering seamless seat reservation, real-time availability sync, and contactless digital ticketing.
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Movies</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><Link to="/movies?status=Now Showing" className="hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=Coming Soon" className="hover-white">Coming Soon</Link></li>
              <li><Link to="/movies?genre=Sci-Fi" className="hover-white">Sci-Fi Blockbusters</Link></li>
              <li><Link to="/movies?genre=Action" className="hover-white">Action Thrillers</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Cinemas</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><Link to="/theatres?city=Mumbai" className="hover-white">Mumbai Multiplexes</Link></li>
              <li><Link to="/theatres?city=Delhi-NCR" className="hover-white">Delhi-NCR Theatres</Link></li>
              <li><Link to="/theatres?city=Bengaluru" className="hover-white">Bengaluru Screens</Link></li>
              <li><Link to="/theatres?city=Hyderabad" className="hover-white">Hyderabad IMAX</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Account</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><Link to="/my-bookings" className="hover-white">My Bookings</Link></li>
              <li><Link to="/profile" className="hover-white">Profile Settings</Link></li>
              <li><Link to="/login" className="hover-white">Sign In</Link></li>
              <li><Link to="/register" className="hover-white">Create Account</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3">Demo Accounts</h6>
            <div className="card bg-dark border-secondary border-opacity-50 p-2 small">
              <div className="text-warning fw-semibold">Admin:</div>
              <div className="text-white">admin@imovies.com</div>
              <div className="text-muted extra-small">Pass: Admin@123</div>
              <hr className="my-1 border-secondary" />
              <div className="text-info fw-semibold">Demo User:</div>
              <div className="text-white">user@imovies.com</div>
              <div className="text-muted extra-small">Pass: User@123</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row align-items-center justify-content-between text-secondary small gap-3">
          <div>
            &copy; {new Date().getFullYear()} IMovies Cinema Management System. Full-Stack MERN Project.
          </div>
          <div className="d-flex align-items-center gap-1">
            Built with <Heart size={14} className="text-danger fill-danger mx-1" /> for Academic Project Evaluation.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
