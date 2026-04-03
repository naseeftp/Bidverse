import { BrowserRouter as Router,Routes,Route} from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/users/registerPage";
import VerifyOtpPage from "./pages/users/verifyotpPage";
import UserHomePage from './pages/users/homePage'
import LoginPage from "./pages/users/loginPage";
import AuthSuccessPage from "./pages/users/AuthSuccessPage";
import ToastProvider from "./components/common/ToastProvider";
function App() {


  return (
     <Router>
      <ToastProvider />
      <MainLayout>
        <Routes>
           <Route path="/" element={<LandingPage />} />
           <Route path="/register" element={<RegisterPage />} />
           <Route path="/verify-otp" element={<VerifyOtpPage />} />
           <Route path="/home" element={<UserHomePage/>} />
           <Route path="/login" element={<LoginPage/>}/>
           <Route path="/auth-success" element={<AuthSuccessPage />} />
        </Routes>
        </MainLayout>
     </Router>
      
  )
}

export default App
