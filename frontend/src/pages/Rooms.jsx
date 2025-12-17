import React, { useEffect, useState } from 'react';
import api from '../api/client';

const statusVariant = {
  available: 'success',
  occupied: 'danger',
  maintenance: 'warning',
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    capacity: '',
    check_in: '',
    check_out: '',
    amenities: '',
  });

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/rooms', {
        params: {
          type: filters.type || undefined,
          status: filters.status || undefined,
          capacity: filters.capacity || undefined,
          check_in: filters.check_in || undefined,
          check_out: filters.check_out || undefined,
          amenities: filters.amenities || undefined,
        },
      });
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    loadRooms();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h2 className="mb-0">Room finder</h2>
        <span className="text-muted small">Search by dates, capacity, and preferences</span>
      </div>
      <form className="card card-body shadow-sm mb-4" onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Room type</label>
            <input className="form-control" name="type" value={filters.type} onChange={handleChange} placeholder="Suite, standard..." />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select className="form-select" name="status" value={filters.status} onChange={handleChange}>
              <option value="">Any</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Guests</label>
            <input
              type="number"
              min="1"
              className="form-control"
              name="capacity"
              value={filters.capacity}
              onChange={handleChange}
              placeholder="2"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Check-in</label>
            <input type="date" className="form-control" name="check_in" value={filters.check_in} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Check-out</label>
            <input type="date" className="form-control" name="check_out" value={filters.check_out} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Amenities</label>
            <input
              className="form-control"
              name="amenities"
              value={filters.amenities}
              onChange={handleChange}
              placeholder="wifi, balcony, workspace..."
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">Loading rooms...</div>
      ) : rooms.length ? (
        <div className="row g-3">
          {rooms.map((room) => (
            <div className="col-md-4" key={room.id}>
              <div className="card shadow-sm h-100 card-hover">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{room.name}</h5>
                    <span className={`badge bg-${statusVariant[room.status] || 'secondary'}`}>{room.status}</span>
                  </div>
                  <p className="text-muted">{room.description}</p>
                  <div className="mb-2">
                    <span className="fw-bold">${room.price}</span> / night • Sleeps {room.capacity}
                  </div>
                  <p className="small text-secondary mb-0">Type: {room.type || 'N/A'}</p>
                  {room.amenities?.length > 0 && (
                    <p className="small text-secondary mb-0">Amenities: {room.amenities.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning">No rooms match the current filters.</div>
      )}
    </div>
  );
};

export default Rooms;
