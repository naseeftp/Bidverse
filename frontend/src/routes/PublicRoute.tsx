import { Navigate, Outlet,useLocation} from 'react-router-dom'
import { useAppSelector } from '../hooks/redux.hooks'
import { getDashboardPath } from '../utils/roleRedirect'

const PublicRoute = () => {
    const { isAuthenticated, role } = useAppSelector((state) => state.auth)
    const location=useLocation();
    const hybridPaths = ['/forgot-pass', '/reset-password','/forgot-verify-otp','/tenant/forgot-pass','/tenant/forgot-verify-otp',"/tenant/reset-password"];
    const isHybridPath = hybridPaths.includes(location.pathname)
    if (isAuthenticated&&!isHybridPath) {
        return <Navigate to={getDashboardPath(role)} replace />
    }
    return <Outlet />
}

export default PublicRoute;