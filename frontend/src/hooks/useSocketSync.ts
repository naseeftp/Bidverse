import { useEffect } from "react";
import { useAppSelector } from "./redux.hooks";
import { connectSocket, disConnectSocket } from "../services/socket.service";


export const useSocketSync = () => {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const userId = user?.userId;
    const role = user?.role || 'user'
    useEffect(() => {
        if (isAuthenticated && userId) {
            connectSocket(userId, role)
        }
        else {
            disConnectSocket()
        }
        return () => {
            disConnectSocket()
        }
    }, [isAuthenticated, userId, role])
}