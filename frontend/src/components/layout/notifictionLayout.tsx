import React, { useEffect, useState } from "react";
import { Bell, X, Info, AlertTriangle, CheckCircle, Shield, Building, User } from 'lucide-react';
import type { NotificationResponseDTO } from "../../types/notification.dto";
import toast from "react-hot-toast";
import notificationService from "../../services/notification.service";


const THEME_CONFIG = {
    user: {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        header: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        tabActive: 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400',
        unreadDot: 'bg-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: User,
        label: 'User'
    },
    admin: {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        header: 'bg-gradient-to-r from-purple-700 to-slate-900',
        tabActive: 'text-purple-600 border-purple-600 dark:text-purple-400 dark:border-purple-400',
        unreadDot: 'bg-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        icon: Shield,
        label: 'Admin'
    },
    tenant: {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        header: 'bg-gradient-to-r from-emerald-600 to-teal-700',
        tabActive: 'text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400',
        unreadDot: 'bg-emerald-500',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        icon: Building,
        label: 'Tenant'
    }
};
interface NotificationWorkspaceProps {
  roleTheme?: 'user' | 'admin' | 'tenant';
  isOpen: boolean;
  onClose: () => void;
}
export const NotificationWorkSpace:React.FC<NotificationWorkspaceProps>= ({ roleTheme = 'user', isOpen, onClose }) => {
    const [notications, setNotifications] = useState<NotificationResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (isOpen) {
            const fetchNotifications = async () => {
                setLoading(true)
                try {
                    const response = await notificationService.getAllNotifications();
                    if (response.success && response.data) {
                        setNotifications(response.data)
                    } else {
                        toast.error(response.message);
                    }
                } catch {
                    toast.error('failed fetch Notifications')
                } finally {
                    setLoading(false)
                }


            }
            fetchNotifications()
        }
    }, [isOpen, roleTheme])
    if(!isOpen) return null
}