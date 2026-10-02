import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px - 400px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
