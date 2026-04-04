import {Navigate,Outlet} from 'react-router-dom'
import {useAppSelector} from '../hooks/redux.hooks'


const PublicRoute=()=>{
    const {isAuthenticated}=useAppSelector((state)=>state.auth)
    if(isAuthenticated){
        return <Navigate to='/home' replace/>
    }
    return <Outlet/>
}

export default PublicRoute;