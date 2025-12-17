import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const statuses = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];

const ServiceDesk = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRequest = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Guest service desk</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Request</th>
              <th>Preferred time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.guest_email}</td>
                <td>{request.room_name || '—'}</td>
                <td>
                  <div className="fw-semibold text-capitalize">{request.type}</div>
                  <div className="small text-muted">{request.details}</div>
                </td>
                <td>{request.preferred_time ? new Date(request.preferred_time).toLocaleString() : 'Flexible'}</td>
                <td className="text-end">
                  <div className="btn-group">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        className={`btn btn-sm btn-${request.status === status ? 'primary' : 'outline-primary'}`}
                        onClick={() => updateRequest(request.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {!requests.length && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No open requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceDesk;
