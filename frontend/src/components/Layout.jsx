import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="d-flex flex-column min-vh-100 bg-light">
    <Navbar />
    <main className="container flex-fill py-4">{children}</main>
    <Footer />
  </div>
);

export default Layout;
