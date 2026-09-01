import {io,Socket} from 'socket.io-client';
import { API_BASE_URL } from '../constants/api.constant';


const socketUrl=API_BASE_URL;
let socket:Socket|null=null;
export const getSocket=():Socket=>{
    if(!socket){
       socket=io(socketUrl,{
        path:'/socket',
        autoConnect:false,
        withCredentials:true
       })
    }
    return socket
}

export const connectSocket=(userId:string,role:string,userName:string)=>{
    const s=getSocket();
    if(s.connected) return;
    s.auth={userId,role,userName}
    s.off('connect');
    s.connect()
}

export const disConnectSocket=()=>{
    if(socket&&socket.connected){
        socket.disconnect();
        socket=null;
    }
}
