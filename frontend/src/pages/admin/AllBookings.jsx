import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { formatDate, formatDateTime } from '../../utils/date';

const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">All Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates & guests</th>
              <th>Status</th>
              <th>Invoice</th>
              <th>Extras</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.user_email || booking.user?.email}</td>
                <td>{booking.room_name || booking.room?.name}</td>
                <td>
                  {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                  <div className="text-muted small">{booking.guest_count} guest(s)</div>
                </td>
                <td>{booking.status}</td>
                <td>
                  <div className="text-capitalize">{booking.payment_status}</div>
                  {booking.invoice_due_at && (
                    <div className="small text-muted">Due {formatDateTime(booking.invoice_due_at)}</div>
                  )}
                </td>
                <td>
                  <div className="small">
                    Meal: {booking.meal_package || 'room-only'}
                    <br />
                    Add-ons: {Array.isArray(booking.addons) && booking.addons.length ? booking.addons.join(', ') : 'None'}
                  </div>
                  {booking.special_requests && <div className="small text-muted">Request: {booking.special_requests}</div>}
                </td>
                <td>${Number(booking.total_price || 0).toFixed(2)}</td>
                <td className="text-end">
                  <div className="btn-group">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`btn btn-sm btn-${booking.status === status ? 'primary' : 'outline-primary'}`}
                        onClick={() => updateStatus(booking.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllBookings;
