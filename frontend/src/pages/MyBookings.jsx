import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatDate, formatDateTime } from '../utils/date';

const statusVariant = {
  pending: 'secondary',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'primary',
};

const paymentVariant = {
  pending: 'warning',
  paid: 'success',
  expired: 'danger',
  cancelled: 'secondary',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/me');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const payForBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/pay`);
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitReview = async (bookingId) => {
    try {
      await api.post('/reviews', { booking_id: bookingId, ...reviewForm });
      setReviewTarget(null);
      setReviewForm({ rating: 5, comment: '' });
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderExtras = (booking) => {
    const addons = Array.isArray(booking.addons) ? booking.addons : [];
    if (!addons.length && booking.meal_package === 'room-only') return 'None';
    const extras = [];
    if (booking.meal_package && booking.meal_package !== 'room-only') {
      extras.push(`Meal plan: ${booking.meal_package}`);
    }
    if (addons.length) {
      extras.push(`Services: ${addons.join(', ')}`);
    }
    return extras.join(' • ');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h2 className="mb-0">My Bookings</h2>
        <Link className="btn btn-outline-secondary btn-sm" to="/service-requests">
          Request extra services
        </Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Room</th>
                <th>Dates & guests</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Extras</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <React.Fragment key={booking.id}>
                  <tr>
                    <td>
                      <div className="fw-semibold">{booking.room_name || booking.room?.name}</div>
                      <div className="text-muted small">Reservation #{booking.id}</div>
                    </td>
                    <td>
                      <div>
                        {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                      </div>
                      <div className="small text-muted">{booking.guest_count} guest(s)</div>
                    </td>
                    <td>
                      <div>
                        <span className={`badge bg-${statusVariant[booking.status] || 'secondary'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`badge bg-${paymentVariant[booking.payment_status] || 'secondary'}`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>${Number(booking.total_price || 0).toFixed(2)}</div>
                      {booking.invoice_due_at && (
                        <div className="small text-muted">Due by {formatDateTime(booking.invoice_due_at)}</div>
                      )}
                    </td>
                    <td>{renderExtras(booking)}</td>
                    <td className="text-end">
                      <div className="d-flex flex-column gap-2">
                        {booking.payment_status === 'pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => payForBooking(booking.id)}>
                            Pay now
                          </button>
                        )}
                        {booking.status === 'pending' && (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => cancelBooking(booking.id)}>
                            Cancel
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setReviewTarget(booking.id)}
                          >
                            {reviewTarget === booking.id ? 'Hide review' : 'Review stay'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {reviewTarget === booking.id && (
                    <tr>
                      <td colSpan="6">
                        <div className="card card-body bg-light">
                          <div className="row g-3 align-items-end">
                            <div className="col-md-2">
                              <label className="form-label">Rating</label>
                              <select
                                className="form-select"
                                value={reviewForm.rating}
                                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                              >
                                {[5, 4, 3, 2, 1].map((value) => (
                                  <option key={value} value={value}>
                                    {value} star{value > 1 ? 's' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-8">
                              <label className="form-label">Comments</label>
                              <textarea
                                className="form-control"
                                rows="2"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                              ></textarea>
                            </div>
                            <div className="col-md-2">
                              <button className="btn btn-primary w-100" onClick={() => submitReview(booking.id)}>
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
