import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { formatDate, formatDateTime } from '../utils/date';

const requestTypes = [
  { id: 'spa', label: 'Spa treatment' },
  { id: 'pickup', label: 'Airport pickup' },
  { id: 'gym', label: 'Gym session' },
  { id: 'tour', label: 'Guided tour' },
  { id: 'meeting', label: 'Meeting with concierge' },
  { id: 'concierge', label: 'Concierge assistance' },
  { id: 'other', label: 'Other request' },
];

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ booking_id: '', type: 'spa', details: '', preferred_time: '' });

  const loadData = async () => {
    try {
      const [{ data: requestData }, { data: bookingData }] = await Promise.all([
        api.get('/requests/me'),
        api.get('/bookings/me'),
      ]);
      setRequests(requestData.requests || []);
      setBookings((bookingData.bookings || []).filter((booking) => booking.status === 'confirmed'));
      if (!form.booking_id && bookingData.bookings?.length) {
        const confirmed = bookingData.bookings.find((booking) => booking.status === 'confirmed');
        if (confirmed) {
          setForm((prev) => ({ ...prev, booking_id: confirmed.id }));
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/requests', { ...form, booking_id: Number(form.booking_id) });
      setForm({ ...form, details: '', preferred_time: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-3">Request a service</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {bookings.length === 0 ? (
              <div className="alert alert-warning">Only confirmed bookings can request services.</div>
            ) : (
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Booking</label>
                  <select className="form-select" name="booking_id" value={form.booking_id} onChange={handleChange} required>
                    <option value="">Select</option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        #{booking.id} • {booking.room_name} ({formatDate(booking.check_in)} → {formatDate(booking.check_out)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Type</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                    {requestTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Details</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label">Preferred time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="preferred_time"
                    value={form.preferred_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary w-100" type="submit">
                    Submit request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-7">
        <h2 className="mb-3">My requests</h2>
        <div className="list-group">
          {requests.map((request) => (
            <div key={request.id} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-capitalize">{request.type}</div>
                  <div className="text-muted small">{request.details}</div>
                  <div className="small">
                    Booking #{request.booking_id} •{' '}
                    {request.preferred_time ? formatDateTime(request.preferred_time) : 'Any time'}
                  </div>
                </div>
                <span className="badge text-bg-primary text-capitalize">{request.status}</span>
              </div>
            </div>
          ))}
          {!requests.length && <div className="alert alert-light mb-0">No requests yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
