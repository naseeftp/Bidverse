 import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";


// interface MainLayoutProps{
//     children:React.ReactNode;
// }

// const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
//   return (
    
//     <div className="flex flex-col min-h-screen bg-brand-bg selection:bg-brand-primary/20">
//       <Navbar />
//       <main className="flex-grow">
//         {children}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MainLayout

// components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";

const MainLayout:React.FC = () => (
  <div className="flex flex-col min-h-screen bg-brand-bg">
    <Navbar />
    <main className="flex-grow">
      <Outlet /> 
    </main>
    <Footer />
  </div>
);
 export default MainLayout