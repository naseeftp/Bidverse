import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import TenantLayout from "./components/layout/tenant/TenantLayout";
import AdminLayout from "./components/layout/admin/AminLayout";
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
import TenantForgotPassPage from "./pages/tenant/ForgotpassPage";
import TenantForgotPassVerifyOtp from "./pages/tenant/ForgotpassVerifyotp";
import TenantResetPasswordPage from "./pages/tenant/ResetpassPage";
import TenantDashboard from "./pages/tenant/Dashbord";
import TenantVerificationForm from "./pages/tenant/VerificationPage";
import TenantVerificationResubmissionPage from './pages/tenant/resubmissionPage'


import AdminLoginPage from "./pages/admin/LoginPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AuctionHouseTable from "./pages/admin/auctionHouseLits";
import AuctionHouseDetailPage from './pages/admin/auctionHousedetailsPage'
import UsersListPage from "./pages/admin/usersList";

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
                  <Route path='/tenant/forgot-pass' element={<TenantForgotPassPage />} />
                  <Route path='/tenant/forgot-verify-otp' element={<TenantForgotPassVerifyOtp />} />
                  <Route path="/tenant/reset-password" element={<TenantResetPasswordPage />} />
               </Route>

               <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                  <Route path="/tenant/dashboard" element={<TenantDashboard />} />
                  <Route path='/tenant/verification-form' element={<TenantVerificationForm />}></Route>
                  <Route path="/tenant/resubmit-verification" element={<TenantVerificationResubmissionPage/>}/>
               </Route>

            </Route>

            <Route element={<AdminLayout />}>
               <Route element={<PublicRoute />}>
                  <Route path="/admin" element={<AdminLoginPage />} />
               </Route>
               <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/auction-houses" element={<AuctionHouseTable />} />
                  <Route path="/admin/auction-house/:id" element={<AuctionHouseDetailPage />} />
                  <Route path='/admin/users' element={<UsersListPage />} />
               </Route>
            </Route>




         </Routes>

      </Router>

   )
}

export default App
