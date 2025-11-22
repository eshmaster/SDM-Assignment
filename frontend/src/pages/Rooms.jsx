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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data.rooms || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Rooms</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center">Loading rooms...</div>
      ) : (
        <div className="row g-3">
          {rooms.map((room) => (
            <div className="col-md-4" key={room.id}>
              <div className="card shadow-sm h-100 card-hover">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{room.name}</h5>
                    <span className={`badge bg-${statusVariant[room.status] || 'secondary'}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-muted">{room.description}</p>
                  <p className="fw-bold">${room.price} / night</p>
                  <p className="small text-secondary">Type: {room.type || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
