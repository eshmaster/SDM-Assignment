import React, { useEffect, useState } from 'react';
import api from '../../api/client';

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
              <th>Dates</th>
              <th>Status</th>
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
                  {booking.check_in} → {booking.check_out}
                </td>
                <td>{booking.status}</td>
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
