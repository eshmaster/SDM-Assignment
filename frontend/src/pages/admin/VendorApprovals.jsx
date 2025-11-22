import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const VendorApprovals = () => {
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');

  const loadVendors = async () => {
    try {
      const { data } = await api.get('/vendors');
      setVendors(data.vendors || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const updateVendor = async (id, action) => {
    try {
      await api.put(`/vendors/${id}/${action}`);
      loadVendors();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Vendor Approvals</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.name}</td>
                <td>{vendor.email}</td>
                <td>
                  <span className={`badge bg-${vendor.approval_status === 'approved' ? 'success' : vendor.approval_status === 'rejected' ? 'danger' : 'warning'}`}>
                    {vendor.approval_status}
                  </span>
                </td>
                <td className="text-end">
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-success" onClick={() => updateVendor(vendor.id, 'approve')}>
                      Approve
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => updateVendor(vendor.id, 'reject')}>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorApprovals;
