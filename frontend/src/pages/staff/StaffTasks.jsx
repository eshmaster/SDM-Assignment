import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const StaffTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/tasks/me');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-3">My Tasks</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="list-group">
        {tasks.map((task) => (
          <div key={task.id} className="list-group-item list-group-item-action">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{task.title}</h5>
                <p className="mb-1 text-muted">{task.description}</p>
              </div>
              <div className="btn-group">
                {['pending', 'in_progress', 'done'].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm btn-${task.status === status ? 'primary' : 'outline-primary'}`}
                    onClick={() => updateStatus(task.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffTasks;
