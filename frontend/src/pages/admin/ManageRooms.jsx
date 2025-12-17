import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const initialForm = { name: '', price: '', type: '', status: 'available', capacity: 1, amenities: '' };

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);

  const loadRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) };
      if (editing) {
        await api.put(`/rooms/${editing}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      setForm(initialForm);
      setEditing(null);
      loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const editRoom = (room) => {
    setEditing(room.id);
    setForm({
      name: room.name,
      price: room.price,
      type: room.type,
      status: room.status,
      capacity: room.capacity || 1,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities || '',
    });
  };

  const deleteRoom = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <h2 className="mb-3">Rooms</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Amenities</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  <td>{room.type}</td>
                  <td>
                    <span className={`badge bg-${room.status === 'available' ? 'success' : room.status === 'occupied' ? 'danger' : 'warning'}`}>
                      {room.status}
                    </span>
                  </td>
                  <td>{room.capacity}</td>
                  <td className="small">{Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities}</td>
                  <td>${room.price}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editRoom(room)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRoom(room.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-3">{editing ? 'Edit Room' : 'Add Room'}</h3>
            <form className="row g-3" onSubmit={saveRoom}>
              <div className="col-12">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Type</label>
                <input type="text" name="type" className="form-control" value={form.type} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  className="form-control"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amenities (comma separated)</label>
                <input
                  type="text"
                  name="amenities"
                  className="form-control"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="wifi, balcony..."
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;
