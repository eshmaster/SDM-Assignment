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
  const [billing, setBilling] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, billingRes] = await Promise.all([api.get('/admin/stats'), api.get('/billing/summary')]);
        setStats(statsRes.data || {});
        setBilling(billingRes.data || null);
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
      <div className="row g-3 mb-4">
        <Card title="Rooms" value={stats.rooms || 0} />
        <Card title="Upcoming check-ins" value={stats.upcoming || 0} variant="success" />
        <Card title="Pending vendors" value={stats.pendingVendors || 0} variant="warning" />
        <Card title="Open tasks" value={stats.openTasks || 0} variant="info" />
        <Card title="Monthly revenue" value={`$${Number(stats.monthlyRevenue || 0).toFixed(0)}`} variant="dark" />
        <Card title="Occupancy" value={`${stats.occupancyRate || 0}%`} variant="secondary" />
        <Card title="Outstanding invoices" value={stats.pendingInvoices || 0} variant="danger" />
        <Card title="Vendor spend" value={`$${Number(stats.vendorSpend || 0).toFixed(0)}`} variant="primary" />
        <Card title="Open requests" value={stats.openRequests || 0} variant="light" />
      </div>
      {Array.isArray(stats.serviceDemand) && stats.serviceDemand.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title mb-3">Service demand</h4>
            <div className="d-flex flex-wrap gap-3">
              {stats.serviceDemand.map((item) => (
                <div key={item.type} className="badge text-bg-primary text-capitalize">
                  {item.type}: {item.count}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {billing && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h4 className="card-title mb-3">Billing summary ({billing.month})</h4>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-muted small text-uppercase">Revenue</div>
                <div className="fs-4">${Number(billing.revenue || 0).toFixed(0)}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small text-uppercase">Outstanding invoices</div>
                <div className="fs-4">{billing.outstandingInvoices || 0}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small text-uppercase">Vendor fees due</div>
                <div className="fs-4">${Number(billing.vendorFeesDue || 0).toFixed(0)}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small text-uppercase">Vendor jobs completed</div>
                <div className="fs-4">{billing.completedVendorJobs || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
