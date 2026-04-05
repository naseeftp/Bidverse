import { BrowserRouter as Router,Routes,Route} from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
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

import AuthSuccessPage from "./pages/users/AuthSuccessPage";

function App() {


  return (
     <Router>
      <ToastProvider />
      <MainLayout>
        <Routes>
           
           <Route path="/auth-success" element={<AuthSuccessPage />} />
           
           <Route element={<PublicRoute/>}>
           <Route path="/register" element={<RegisterPage />} />
           <Route path="/verify-otp" element={<VerifyOtpPage />} />
           <Route path="/login" element={<LoginPage/>}/>
           <Route path="/" element={<LandingPage />} />
           <Route path='/forgot-pass' element={<ForgotPassPage/>}/>
           <Route path='/forgot-verify-otp' element={<ForgotPassVeifyOtpPage/>}/>
           </Route>
           
           <Route element={<ProtectedRoute/>}>
            <Route path="/home" element={<UserHomePage/>} />
           </Route>
           
           
           
        </Routes>
        </MainLayout>
     </Router>
      
  )
}

export default App
