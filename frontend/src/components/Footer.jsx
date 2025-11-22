import React from 'react';

const Footer = () => (
  <footer className="bg-dark text-light py-3 mt-auto">
    <div className="container d-flex justify-content-between">
      <span>© {new Date().getFullYear()} Hospitality Portal</span>
      <span className="text-secondary">Manage rooms, bookings, vendors, and tasks efficiently.</span>
    </div>
  </footer>
);

export default Footer;
