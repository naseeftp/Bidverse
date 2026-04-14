import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux.hooks'
import { getDashboardPath } from '../utils/roleRedirect'

const PublicRoute = () => {
    const { isAuthenticated, role } = useAppSelector((state) => state.auth)
    if (isAuthenticated) {
        return <Navigate to={getDashboardPath(role)} replace />
    }
    return <Outlet />
}

export default PublicRoute;