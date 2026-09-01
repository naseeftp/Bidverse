import { useEffect } from "react";
import { useAppSelector } from "./redux.hooks";
import { connectSocket, disConnectSocket } from "../services/socket.service";


export const useSocketSync = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const userId = user?.userId;
    const role = user?.role || 'user';
    const userName=user?.name||'Anonymous User'
    useEffect(() => {
        if (isAuthenticated && userId) {
            connectSocket(userId, role,userName)
        }
        else {
            disConnectSocket()
        }
        return () => {
            disConnectSocket()
        }
    }, [isAuthenticated, userId, role,userName])
}