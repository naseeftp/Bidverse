import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-brand-bg">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);
export default MainLayout