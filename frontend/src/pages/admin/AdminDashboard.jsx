import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const Card = ({ title, value, variant = 'primary' }) => (
  <div className="col-md-3">
    <div className={`card text-bg-${variant} mb-3`}>
      <div className="card-body">
        <div className="fw-semibold text-uppercase small">{title}</div>
        <div className="display-6">{value}</div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data || {});
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Admin Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <Card title="Rooms" value={stats.rooms || 0} />
        <Card title="Upcoming check-ins" value={stats.upcoming || 0} variant="success" />
        <Card title="Pending vendors" value={stats.pendingVendors || 0} variant="warning" />
        <Card title="Open tasks" value={stats.openTasks || 0} variant="info" />
      </div>
    </div>
  );
};

export default AdminDashboard;
