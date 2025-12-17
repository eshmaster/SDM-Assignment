import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import ServiceRequests from './pages/ServiceRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import AllBookings from './pages/admin/AllBookings';
import VendorApprovals from './pages/admin/VendorApprovals';
import TasksPage from './pages/admin/TasksPage';
import StaffTasks from './pages/staff/StaffTasks';
import ServiceDesk from './pages/staff/ServiceDesk';
import VendorDashboard from './pages/vendor/VendorDashboard';
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
        path="/service-requests"
        element={(
          <ProtectedRoute roles={['guest']}>
            <ServiceRequests />
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
        path="/staff/requests"
        element={(
          <ProtectedRoute roles={['staff', 'admin']}>
            <ServiceDesk />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/vendor"
        element={(
          <ProtectedRoute roles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        )}
      />
      <Route path="/vendor/jobs" element={<Navigate to="/vendor" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
