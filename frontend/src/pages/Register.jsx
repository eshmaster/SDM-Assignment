import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest',
    service_type: '',
    vendor_rate: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-3">Create an account</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="guest">Guest</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              {form.role === 'vendor' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Service type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="service_type"
                      value={form.service_type}
                      onChange={handleChange}
                      placeholder="e.g. laundry, transportation"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rate (per job)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="vendor_rate"
                      value={form.vendor_rate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
