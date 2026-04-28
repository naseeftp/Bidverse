import axios from "axios";
import { API_BASE_URL, AUTH_ROUTES } from "../constants/api.constant";
import toast from "react-hot-toast";


const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

axiosInstance.interceptors.response.use(
    (response) => response.data,

    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);
        const isLoginRequest = originalRequest.url?.includes(AUTH_ROUTES.LOGIN);
        if (isLoginRequest) {
            return Promise.reject(error)
        }
        if (error.response?.status === 403) {
            const message = error.response.data?.message;
            if (message.toLowerCase().includes('blocked')) {
                const reason = encodeURIComponent(error.response.data?.reason);
                toast.error(`Access Revoked Due to: ${reason}`)
                localStorage.removeItem("accessToken")
                window.location.href = `/?auth_error=blocked&reason=${reason}`;
            }

            return Promise.reject(error)
        }
        if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
            originalRequest._retry = true
            try {
                const res = await axios.post(`${API_BASE_URL}${AUTH_ROUTES.REFRESH}`, {}, { withCredentials: true })
                const newToken = res.data?.data;
                if (newToken) {
                    localStorage.setItem('accessToken', newToken)
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return axiosInstance(originalRequest)
                }
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                window.location.href = '/?auth_error=expired'
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error);
    }


)

export default axiosInstance;




