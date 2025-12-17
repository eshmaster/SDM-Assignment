import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { addonServices, mealPackages } from '../data/catalog';

const BookingForm = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    room_id: '',
    check_in: '',
    check_out: '',
    guest_count: 1,
    requested_room_type: '',
    preferences: '',
    special_requests: '',
    meal_package: 'room-only',
    addons: [],
  });

  const loadRooms = async () => {
    setSearching(true);
    try {
      const { data } = await api.get('/rooms', {
        params: {
          status: 'available',
          check_in: form.check_in || undefined,
          check_out: form.check_out || undefined,
          capacity: form.guest_count || undefined,
          type: form.requested_room_type || undefined,
          search: form.preferences || undefined,
        },
      });
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (form.check_in && form.check_out) {
      loadRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.check_in, form.check_out, form.guest_count, form.requested_room_type]);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const start = new Date(form.check_in);
    const end = new Date(form.check_out);
    const diff = end - start;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [form.check_in, form.check_out]);

  const selectedRoom = rooms.find((room) => String(room.id) === String(form.room_id));
  const extrasTotal = useMemo(() => {
    const mealFee = mealPackages.find((pkg) => pkg.id === form.meal_package)?.price || 0;
    const addonTotal = addonServices
      .filter((addon) => form.addons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    return mealFee + addonTotal;
  }, [form.addons, form.meal_package]);
  const roomTotal = selectedRoom && nights > 0 ? nights * Number(selectedRoom.price || 0) : 0;
  const totalPrice = roomTotal + extrasTotal;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guest_count' ? Number(value) : value,
    }));
  };

  const toggleAddon = (id) => {
    setForm((prev) => ({
      ...prev,
      addons: prev.addons.includes(id) ? prev.addons.filter((addon) => addon !== id) : [...prev.addons, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (nights <= 0) {
        throw new Error('Check-out must be after check-in.');
      }
      if (!selectedRoom) {
        throw new Error('Please choose a room before submitting.');
      }
      const payload = {
        ...form,
        room_id: Number(form.room_id),
      };
      await api.post('/bookings', payload);
      navigate('/bookings/me');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-xl-9 col-lg-10">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="card-title mb-0">Book a stay</h2>
              <button type="button" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={loadRooms} disabled={searching}>
                <span>Refresh availability</span>
                {searching && <span className="text-muted small">(searching...)</span>}
              </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="check_in">Check-in</label>
                <input
                  type="date"
                  name="check_in"
                  id="check_in"
                  className="form-control"
                  value={form.check_in}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="check_out">Check-out</label>
                <input
                  type="date"
                  name="check_out"
                  id="check_out"
                  className="form-control"
                  value={form.check_out}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="guest_count">Guests</label>
                <input
                  type="number"
                  name="guest_count"
                  id="guest_count"
                  min="1"
                  max="8"
                  className="form-control"
                  value={form.guest_count}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="requested_room_type">Preferred room type</label>
                <input
                  type="text"
                  name="requested_room_type"
                  id="requested_room_type"
                  className="form-control"
                  value={form.requested_room_type}
                  onChange={handleChange}
                  placeholder="e.g. suite, deluxe"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="preferences">Preferences</label>
                <input
                  type="text"
                  name="preferences"
                  id="preferences"
                  className="form-control"
                  value={form.preferences}
                  onChange={handleChange}
                  placeholder="City view, workspace, etc."
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="room_id">Select room</label>
                <select className="form-select" id="room_id" name="room_id" value={form.room_id} onChange={handleChange} required>
                  <option value="">{rooms.length ? 'Choose from available rooms' : 'No rooms available yet'}</option>
                  {rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                      title={`${room.name} • $${room.price} / night • Sleeps ${room.capacity}`}
                    >
                      {room.name}
                    </option>
                  ))}
                </select>
                {selectedRoom && (
                  <div className="small text-muted mt-1">
                    <div>
                      Rate: ${selectedRoom.price} / night • Sleeps {selectedRoom.capacity}
                    </div>
                    {selectedRoom.amenities?.length > 0 && (
                      <div>Amenities: {selectedRoom.amenities.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="meal_package">Meal package</label>
                <select className="form-select" id="meal_package" name="meal_package" value={form.meal_package} onChange={handleChange}>
                  {mealPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.label} (+${pkg.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Extras & services</label>
                <div className="d-flex flex-wrap gap-2">
                  {addonServices.map((addon) => (
                    <div className="form-check form-check-inline" key={addon.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={addon.id}
                        checked={form.addons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                      />
                      <label className="form-check-label" htmlFor={addon.id}>
                        {addon.label} (+${addon.price})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="special_requests">Special requests</label>
                <textarea
                  className="form-control"
                  name="special_requests"
                  id="special_requests"
                  value={form.special_requests}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Late check-in, accessibility needs, celebration setup..."
                ></textarea>
              </div>
              <div className="col-12">
                <div className="alert alert-info mb-0">
                  <div>Nights: {nights}</div>
                  <div>Room total: ${roomTotal.toFixed(2)}</div>
                  <div>Extras: ${extrasTotal.toFixed(2)}</div>
                  <div className="fw-semibold">Provisional invoice: ${totalPrice.toFixed(2)}</div>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit reservation request'}
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
