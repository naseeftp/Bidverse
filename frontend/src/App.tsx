import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import TenantLayout from "./components/layout/tenant/TenantLayout";
import AdminLayout from "./components/layout/admin/AminLayout";
import UsertLayout from "./components/layout/userLayout";
import ToastProvider from "./components/common/ToastProvider";
import PublicRoute from '../src/routes/PublicRoute'
import ProtectedRoute from "./routes/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import PublicAuctionHouses from "./pages/auctionHouses";
import PublicAuctions from "./pages/auctions";
import PublicAuctionDetailPage from "./pages/auctionDetailPage";
import PublicAuctionHouseDetailsPage from "./pages/houseDetails";

import RegisterPage from "./pages/users/registerPage";
import VerifyOtpPage from "./pages/users/verifyotpPage";
import UserHomePage from './pages/users/homePage'
import LoginPage from "./pages/users/loginPage";
import ProfilePage from "./pages/users/ProfilePage";
import ChangePasswordPage from "./pages/users/changePasswordPage";

import ForgotPassPage from "./pages/users/forgotpassPage";
import ForgotPassVeifyOtpPage from './pages/users/forgotPassVerifyOtp'
import NewPasswordPage from "./pages/users/resetPassword";
import ChangeEmailPage from "./pages/users/changeEmailPage";
import ChangeEmailVerifyPage from "./pages/users/changeEmailVerify";
import AuthSuccessPage from "./pages/users/AuthSuccessPage";
import Dashboard from "./pages/users/Dashboard";
import AddressPage from "./pages/users/AddressPage";
import WatchlistPage from "./pages/users/WatchlistPage";
import ChatPage from "./pages/users/chatPage";
import MyBidsPage from "./pages/users/myBids.page";
import MySlotsPage from "./pages/users/mySlots";

import TenantRegisterPage from "./pages/tenant/RegiterPage";
import TenantVerifyOtpPage from "./pages/tenant/VerifyotpPage";
import TenantLoginPage from "./pages/tenant/LoginPage";
import TenantForgotPassPage from "./pages/tenant/ForgotpassPage";
import TenantForgotPassVerifyOtp from "./pages/tenant/ForgotpassVerifyotp";
import TenantResetPasswordPage from "./pages/tenant/ResetpassPage";
import TenantDashboard from "./pages/tenant/Dashbord";
import TenantVerificationForm from "./pages/tenant/VerificationPage";
import TenantVerificationResubmissionPage from './pages/tenant/resubmissionPage'
import TenantProfilePage from './pages/tenant/ProfilePage'
import TenantChangePasswordPage from "./pages/tenant/changePassword";
import TenantChangeEmailPage from "./pages/tenant/changeEmailPage";
import TenantVerifyEmailPage from './pages/tenant/changeEmailVerify'
import CreateAuctionPage from "./pages/tenant/createAuctionPage";
import TenantAuctions from "./pages/tenant/myAuctions";
import TenantAuctionDetailPage from "./pages/tenant/auctionDetailPage";
import TenantEditAuctionPage from "./pages/tenant/updateAuctionPage";
import TenantChatPage from "./pages/tenant/chatPage";
import TenantBidHistoryPage from "./pages/tenant/bidHistoryPage";

import AdminLoginPage from "./pages/admin/LoginPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AuctionHouseTable from "./pages/admin/auctionHouseLits";
import AuctionHouseDetailPage from './pages/admin/auctionHousedetailsPage'
import UsersListPage from "./pages/admin/usersList";
import UserDetailPage from "./pages/admin/userDetailPage";
import AdminAuctionsListPage from "./pages/admin/auctions";
import AdminAuctionDetailPage from "./pages/admin/auctionDetails";
import AdminChatPage from "./pages/admin/chatPage";
import AdminBidHistoryPage from "./pages/admin/bidHistory";

import { useSocketSync } from "./hooks/useSocketSync";

function App() {
   useSocketSync()

   return (
      <Router>
         <ToastProvider />

         <Routes>

            <Route element={<MainLayout />}>
               <Route path="/auth-success" element={<AuthSuccessPage />} />
               <Route path="/auction-houses" element={<PublicAuctionHouses />} />
               <Route path="/auctions" element={<PublicAuctions />} />
               <Route path="/auctions/:itemId" element={<PublicAuctionDetailPage />} />
               <Route path="/auction-house/:houseId" element={<PublicAuctionHouseDetailsPage />} />

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
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/change-password" element={<ChangePasswordPage />} />
                  <Route path="/change-email" element={<ChangeEmailPage />} />
                  <Route path="/change-email-verify" element={<ChangeEmailVerifyPage />} />
                  <Route path="/watch-list" element={<WatchlistPage />} />


               </Route>
            </Route>

            <Route element={<UsertLayout />}>
               <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/addresses" element={<AddressPage />} />
                  <Route path="/my-bids" element={<MyBidsPage />} />
                  <Route path="/my-slots" element={<MySlotsPage/>} />

               </Route>
            </Route>
            <Route path="/chat" element={<ChatPage />} />

            <Route path="/tenant/chat" element={<TenantChatPage />} />
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
                  <Route path="/tenant/resubmit-verification" element={<TenantVerificationResubmissionPage />} />
                  <Route path="/tenant/profile" element={<TenantProfilePage />} />
                  <Route path="/tenant/changePassword" element={<TenantChangePasswordPage />} />
                  <Route path="/tenant/changeEmail" element={<TenantChangeEmailPage />} />
                  <Route path="/tenant/changeEmail-verify" element={<TenantVerifyEmailPage />} />
                  <Route path="/tenant/create-auction" element={<CreateAuctionPage />} />
                  <Route path="/tenant/auctions" element={<TenantAuctions />} />
                  <Route path="/tenant/auctions/:id" element={<TenantAuctionDetailPage />} />
                  <Route path="/tenant/update-auctions/:id" element={<TenantEditAuctionPage />} />
                  <Route path="/tenant/bid-history/:id" element={<TenantBidHistoryPage />} />
                  
              </Route>

            </Route>
            <Route path="/admin/chat" element={<AdminChatPage />} />
            <Route element={<AdminLayout />}>
               <Route element={<PublicRoute />}>
                  <Route path="/admin" element={<AdminLoginPage />} />
               </Route>
               <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/auction-houses" element={<AuctionHouseTable />} />
                  <Route path="/admin/auction-house/:id" element={<AuctionHouseDetailPage />} />
                  <Route path='/admin/users' element={<UsersListPage />} />
                  <Route path='/admin/user/:id' element={<UserDetailPage />} />
                  <Route path="/admin/auctions" element={<AdminAuctionsListPage />} />
                  <Route path="/admin/auctions/:id" element={<AdminAuctionDetailPage />} />
                  <Route path="/admin/bid-history/:id" element={<AdminBidHistoryPage />} />

               </Route>
            </Route>




         </Routes>

      </Router>

   )
}

export default App
