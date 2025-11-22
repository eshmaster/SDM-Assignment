import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const VendorJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/vendors/jobs');
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/vendors/jobs/${id}`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">My Jobs</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {jobs.map((job) => (
          <div key={job.id} className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{job.room_name || 'Service'}</h5>
                  <span className="badge bg-secondary">{job.status}</span>
                </div>
                <p className="text-muted mb-2">{job.description || 'Service task'}</p>
                <p className="small mb-2">Dates: {job.check_in} → {job.check_out}</p>
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
      </div>
    </div>
  );
};

export default VendorJobs;
