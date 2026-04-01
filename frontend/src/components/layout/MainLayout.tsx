import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";


interface MainLayoutProps{
    children:React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // We apply #FFF9F4 to the entire wrapper
    <div className="flex flex-col min-h-screen bg-brand-bg selection:bg-brand-primary/20">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout