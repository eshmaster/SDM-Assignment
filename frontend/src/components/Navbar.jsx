import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Hospitality Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/rooms">
                Rooms
              </NavLink>
            </li>
            {user?.role === 'guest' && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bookings/new">
                    Book a Room
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bookings/me">
                    My Bookings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/service-requests">
                    Service Requests
                  </NavLink>
                </li>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/rooms">
                    Manage Rooms
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/bookings">
                    All Bookings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/vendors">
                    Vendor Approvals
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/tasks">
                    Tasks
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/staff/requests">
                    Service Desk
                  </NavLink>
                </li>
              </>
            )}
            {user?.role === 'staff' && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/staff/tasks">
                    My Tasks
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/staff/requests">
                    Service Desk
                  </NavLink>
                </li>
              </>
            )}
            {user?.role === 'vendor' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/vendor">
                  Vendor Portal
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-2">{user.email}</span>
                </li>
                <li className="nav-item">
                  <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
