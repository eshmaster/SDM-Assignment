import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="py-5 text-center">
    <h1 className="mb-3">Welcome to the Hospitality Portal</h1>
    <p className="lead">Manage bookings, rooms, vendors, and tasks with a unified interface.</p>
    <div className="d-flex gap-3 justify-content-center mt-4">
      <Link className="btn btn-primary" to="/rooms">
        Browse Rooms
      </Link>
      <Link className="btn btn-outline-secondary" to="/login">
        Sign In
      </Link>
    </div>
  </div>
);

export default Home;
