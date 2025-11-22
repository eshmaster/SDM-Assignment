import React, { useEffect, useState } from 'react';
import api from '../api/client';

const statusVariant = {
  pending: 'secondary',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'primary',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
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

  return (
    <div>
      <h2 className="mb-3">My Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Room</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.room_name || booking.room?.name}</td>
                  <td>
                    {booking.check_in} → {booking.check_out}
                  </td>
                  <td>
                    <span className={`badge bg-${statusVariant[booking.status] || 'secondary'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>${Number(booking.total_price || 0).toFixed(2)}</td>
                  <td className="text-end">
                    {booking.status === 'pending' && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => cancelBooking(booking.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
