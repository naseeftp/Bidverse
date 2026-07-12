import { useEffect } from "react";
import { connectSocket,disconnectsSocket } from "../services/socket.service";
import { useAppSelector } from "./redux.hooks";

export const useSocketAuth=()=>{
    const  {user}=useAppSelector((state)=>state.auth);
  
    useEffect(()=>{
      if(user&&user.userId){
        connectSocket(user.userId,user.role)
      }
      return ()=>{
        disconnectsSocket()
      }

    },[user])
    
}