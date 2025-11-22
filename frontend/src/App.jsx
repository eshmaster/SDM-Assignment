import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import AllBookings from './pages/admin/AllBookings';
import VendorApprovals from './pages/admin/VendorApprovals';
import TasksPage from './pages/admin/TasksPage';
import StaffTasks from './pages/staff/StaffTasks';
import VendorJobs from './pages/vendor/VendorJobs';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route
        path="/bookings/new"
        element={(
          <ProtectedRoute roles={['guest']}>
            <BookingForm />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/bookings/me"
        element={(
          <ProtectedRoute roles={['guest']}>
            <MyBookings />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/rooms"
        element={(
          <ProtectedRoute roles={['admin']}>
            <ManageRooms />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/bookings"
        element={(
          <ProtectedRoute roles={['admin']}>
            <AllBookings />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/vendors"
        element={(
          <ProtectedRoute roles={['admin']}>
            <VendorApprovals />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/tasks"
        element={(
          <ProtectedRoute roles={['admin']}>
            <TasksPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/staff/tasks"
        element={(
          <ProtectedRoute roles={['staff']}>
            <StaffTasks />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/vendor/jobs"
        element={(
          <ProtectedRoute roles={['vendor']}>
            <VendorJobs />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
