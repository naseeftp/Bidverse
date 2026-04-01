import { BrowserRouter as Router,Routes,Route} from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/users/registerPage";
import VerifyOtpPage from "./pages/users/verifyotpPage";
import UserHomePage from './pages/users/homePage'
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
           <Route path="/user-home" element={<UserHomePage/>} />
        </Routes>
        </MainLayout>
     </Router>
      
  )
}

export default App
