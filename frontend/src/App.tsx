import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import TenantLayout from "./components/layout/tenant/TenantLayout";
import ToastProvider from "./components/common/ToastProvider";
import PublicRoute from '../src/routes/PublicRoute'
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/users/registerPage";
import VerifyOtpPage from "./pages/users/verifyotpPage";
import UserHomePage from './pages/users/homePage'
import LoginPage from "./pages/users/loginPage";

import ForgotPassPage from "./pages/users/forgotpassPage";
import ForgotPassVeifyOtpPage from './pages/users/forgotPassVerifyOtp'
import NewPasswordPage from "./pages/users/resetPassword";

import AuthSuccessPage from "./pages/users/AuthSuccessPage";

import TenantRegisterPage from "./pages/tenant/RegiterPage";
import TenantVerifyOtpPage from "./pages/tenant/VerifyotpPage";
import TenantLoginPage from "./pages/tenant/LoginPage";
import TenantDashboard from "./pages/tenant/Dashbord";
function App() {


   return (
      <Router>
         <ToastProvider />

         <Routes>

            <Route element={<MainLayout />}>
               <Route path="/auth-success" element={<AuthSuccessPage />} />
               

               <Route element={<PublicRoute />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-otp" element={<VerifyOtpPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path='/forgot-pass' element={<ForgotPassPage />} />
                  <Route path='/forgot-verify-otp' element={<ForgotPassVeifyOtpPage />} />
                  <Route path="/reset-password" element={<NewPasswordPage />} />
               </Route>

               <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                  <Route path="/home" element={<UserHomePage />} />
               </Route>
            </Route>


            <Route element={<TenantLayout />}>

               <Route element={<PublicRoute />}>
                  <Route path="/tenant/register" element={<TenantRegisterPage />} />
                  <Route path="/tenant/verify-otp" element={<TenantVerifyOtpPage />} />
                  <Route path="/tenant/login" element={<TenantLoginPage />} />
               </Route>

               <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                  <Route path="/tenant/dashboard" element={<TenantDashboard />} />
               </Route>

            </Route>



         </Routes>

      </Router>

   )
}

export default App
