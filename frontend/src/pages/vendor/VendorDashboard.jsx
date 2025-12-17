import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
const jobStatusVariant = (status) => {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'info';
  return 'secondary';
};

const approvalVariant = (status) => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning text-dark';
};

const VendorDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [statement, setStatement] = useState(null);
  const [statementJobs, setStatementJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    service_type: '',
    rate: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/vendors/profile');
      setProfile(data.vendor);
      setProfileForm({
        name: data.vendor.name || '',
        service_type: data.vendor.service_type || '',
        rate: data.vendor.rate != null ? String(data.vendor.rate) : '',
        phone: data.vendor.phone || '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data } = await api.get('/vendors/jobs');
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadStatement = async () => {
    try {
      const { data } = await api.get('/vendors/payments/statement');
      setStatement(data.statement);
      setStatementJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshAssignments = () => {
    loadJobs();
    loadStatement();
  };

  useEffect(() => {
    loadProfile();
    loadJobs();
    loadStatement();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileNotice('');
    setError('');
    try {
      const payload = {
        name: profileForm.name?.trim(),
        service_type: profileForm.service_type?.trim(),
        phone: profileForm.phone?.trim(),
        rate: profileForm.rate === '' ? null : Number(profileForm.rate),
      };
      const { data } = await api.put('/vendors/profile', payload);
      setProfile(data.vendor);
      setProfileNotice('Service details saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/vendors/jobs/${id}`, { status });
      await Promise.all([loadJobs(), loadStatement()]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h3 mb-1">Vendor portal</h1>
        <p className="text-muted mb-0">Register your services, review assignments, and track payouts.</p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h5 mb-0">Service registration</h2>
                  <p className="text-muted small mb-0">Let the hotel know what you provide.</p>
                </div>
                {profile && (
                  <span className={`badge bg-${approvalVariant(profile.approval_status)}`}>
                    {profile.approval_status}
                  </span>
                )}
              </div>
              {profile?.approval_status !== 'approved' && (
                <div className="alert alert-warning py-2 small">
                  We&apos;ll notify you once an administrator reviews your service.
                </div>
              )}
              {profileNotice && <div className="alert alert-success py-2 small">{profileNotice}</div>}
              <form className="mt-2" onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label">Business name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Service type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="service_type"
                    value={profileForm.service_type}
                    onChange={handleProfileChange}
                    placeholder="e.g. catering, laundry, transportation"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Standard fee per job (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    name="rate"
                    value={profileForm.rate}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 000-1234"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save service'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h5 mb-0">Payment statement</h2>
                  <p className="text-muted small mb-0">Completed work and payouts update as you deliver.</p>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={refreshAssignments}>
                  Refresh
                </button>
              </div>
              {statement ? (
                <>
                  <div className="row text-center mb-3">
                    <div className="col-6 col-md-4 mb-3 mb-md-0">
                      <div className="fw-bold">{formatCurrency(statement.totalEarned)}</div>
                      <div className="small text-muted">Total earned</div>
                    </div>
                    <div className="col-6 col-md-4 mb-3 mb-md-0">
                      <div className="fw-bold">{statement.completedJobs}</div>
                      <div className="small text-muted">Jobs completed</div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="fw-bold">{formatCurrency(statement.pendingValue)}</div>
                      <div className="small text-muted">Pending fees</div>
                    </div>
                  </div>
                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <div className="fw-bold">{statement.pendingJobs}</div>
                      <div className="small text-muted">Pending</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold">{statement.inProgressJobs}</div>
                      <div className="small text-muted">In progress</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold">{statement.totalJobs}</div>
                      <div className="small text-muted">Total assigned</div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Job</th>
                          <th scope="col">Status</th>
                          <th scope="col">Fee</th>
                          <th scope="col">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statementJobs.length ? (
                          statementJobs.map((job) => (
                            <tr key={job.id}>
                              <td>
                                <div className="fw-semibold">{job.title || `Job #${job.id}`}</div>
                                <div className="small text-muted">
                                  {[job.department, job.task_type].filter(Boolean).join(' • ') || 'Vendor task'}
                                </div>
                              </td>
                              <td>
                                <span className={`badge bg-${jobStatusVariant(job.status)}`}>{job.status}</span>
                              </td>
                              <td>{job.vendor_fee ? formatCurrency(job.vendor_fee) : '—'}</td>
                              <td>{job.updated_at ? new Date(job.updated_at).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-muted">
                              No payout activity yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Loading statement...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Assigned vendor jobs</h2>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={refreshAssignments}>
            Refresh
          </button>
        </div>
        {loadingJobs && <p className="text-muted small">Updating assignments...</p>}
        <div className="row g-3">
          {jobs.map((job) => (
            <div key={job.id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-0">{job.room_name || job.title || 'On-site service'}</h5>
                      <div className="small text-muted text-capitalize">{job.department || job.task_type}</div>
                    </div>
                    <span className={`badge bg-${jobStatusVariant(job.status)}`}>{job.status}</span>
                  </div>
                  <p className="text-muted mb-2">{job.description || 'Service task'}</p>
                  {job.due_date && <p className="small mb-2">Due by {new Date(job.due_date).toLocaleDateString()}</p>}
                  {job.request_type && <p className="small mb-2">Request type: {job.request_type}</p>}
                  {job.vendor_fee ? (
                    <p className="small text-success mb-2">Fee: {formatCurrency(job.vendor_fee)}</p>
                  ) : (
                    <p className="small text-muted mb-2">Fee set upon completion</p>
                  )}
                  <div className="btn-group">
                    {['pending', 'in_progress', 'done'].map((status) => (
                      <button
                        key={status}
                        className={`btn btn-sm btn-${job.status === status ? 'primary' : 'outline-primary'}`}
                        onClick={() => updateStatus(job.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!jobs.length && !loadingJobs && <p className="text-muted">No active jobs assigned.</p>}
        </div>
      </section>
    </div>
  );
};

export default VendorDashboard;
