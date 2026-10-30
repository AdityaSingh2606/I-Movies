import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/admin/payments', { params });
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    return (
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.booking?.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-white display-font mb-1">Payment Ledger</h2>
        <p className="text-secondary small">Audit log of all simulated gateway payment transactions and refunds</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
                placeholder="Search Transaction ID (TXN-...) or Ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div className="col-md-4 d-flex justify-content-md-end gap-2">
            {['All', 'success', 'failed', 'refunded'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  statusFilter === st
                    ? 'btn-info text-dark fw-bold'
                    : 'btn-dark text-secondary border border-secondary border-opacity-25'
                }`}
                onClick={() => setStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner message="Auditing simulated transaction records..." />
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="text-secondary extra-small text-uppercase">
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Mode</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No transactions on record.</td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p._id}>
                      <td className="fw-mono text-white small fw-semibold">{p.transactionId}</td>
                      <td className="fw-mono text-info small">{p.booking?.bookingReference || 'N/A'}</td>
                      <td>
                        <div className="text-white small fw-semibold">{p.user?.name}</div>
                        <div className="text-muted extra-small">{p.user?.email}</div>
                      </td>
                      <td className="text-light small">{p.paymentMethod}</td>
                      <td className="text-success fw-bold small">₹{p.amount}</td>
                      <td>
                        <span className={`badge ${p.status === 'success' ? 'bg-success' : p.status === 'refunded' ? 'bg-info text-dark' : 'bg-danger'} px-2 py-1 rounded-pill extra-small`}>
                          {p.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 extra-small">
                          DEMO
                        </span>
                      </td>
                      <td className="text-secondary extra-small">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
