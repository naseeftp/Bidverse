import {Navigate,Outlet} from 'react-router-dom'
import {useAppSelector} from '../hooks/redux.hooks'


const PublicRoute=()=>{
    const {isAuthenticated,role}=useAppSelector((state)=>state.auth)
    if(isAuthenticated){
        return <Navigate to={role === "tenant" ? "/tenant/dashboard" : "/home"} replace />;
    }
    return <Outlet/>
}

export default PublicRoute;