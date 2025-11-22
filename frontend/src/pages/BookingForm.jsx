import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const BookingForm = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ room_id: '', check_in: '', check_out: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/rooms', { params: { status: 'available' } });
        setRooms(data.rooms || []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const start = new Date(form.check_in);
    const end = new Date(form.check_out);
    const diff = end - start;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [form.check_in, form.check_out]);

  const selectedRoom = rooms.find((room) => String(room.id) === String(form.room_id));
  const totalPrice = selectedRoom && nights > 0 ? nights * Number(selectedRoom.price || 0) : 0;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (nights <= 0) {
        throw new Error('Check-out must be after check-in.');
      }
      await api.post('/bookings', { ...form, total_price: totalPrice });
      navigate('/bookings/me');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-3">New Booking</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Room</label>
                <select className="form-select" name="room_id" value={form.room_id} onChange={handleChange} required>
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - ${room.price} / night
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Check-in</label>
                <input
                  type="date"
                  name="check_in"
                  className="form-control"
                  value={form.check_in}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Check-out</label>
                <input
                  type="date"
                  name="check_out"
                  className="form-control"
                  value={form.check_out}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <div className="alert alert-info mb-0">
                  <div>Nights: {nights}</div>
                  <div>Total price: ${Number.isFinite(totalPrice) ? totalPrice.toFixed(2) : '0.00'}</div>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
