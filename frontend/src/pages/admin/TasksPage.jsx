import React, { useEffect, useState } from 'react';
import api from '../../api/client';

const departments = ['housekeeping', 'maintenance', 'catering', 'guest_services', 'concierge', 'spa', 'transport'];
const initialForm = {
  title: '',
  description: '',
  staff_id: '',
  vendor_id: '',
  booking_id: '',
  room_id: '',
  department: '',
  task_type: '',
  priority: 'normal',
  status: 'pending',
  due_date: '',
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  const loadTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      setForm(initialForm);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-md-7">
        <h2 className="mb-3">Tasks</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.staff_email || 'Unassigned'}</td>
                  <td className="text-capitalize">{task.department || '—'}</td>
                  <td>{task.status}</td>
                  <td className="text-end">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-3">Create Task</h3>
            <form className="row g-3" onSubmit={saveTask}>
              <div className="col-12">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" name="description" value={form.description} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">Staff ID</label>
                <input type="number" className="form-control" name="staff_id" value={form.staff_id} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Vendor ID</label>
                <input type="number" className="form-control" name="vendor_id" value={form.vendor_id} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Booking ID</label>
                <input type="number" className="form-control" name="booking_id" value={form.booking_id} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Room ID</label>
                <input type="number" className="form-control" name="room_id" value={form.room_id} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Department</label>
                <select className="form-select text-capitalize" name="department" value={form.department} onChange={handleChange}>
                  <option value="">Select</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Task type</label>
                <input className="form-control" name="task_type" value={form.task_type} onChange={handleChange} placeholder="booking_prep" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Due date</label>
                <input type="date" className="form-control" name="due_date" value={form.due_date} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
