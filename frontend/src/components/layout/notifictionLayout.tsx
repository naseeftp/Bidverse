import React, { useEffect, useState } from "react";
import {Bell, X, Info, AlertTriangle, CheckCircle, XCircle, Shield, Building, User, Loader2, CheckCheck } from 'lucide-react';
import type { NotificationResponseDTO } from "../../types/notification.dto";
import { NotificationType } from "../../types/notification.dto"; 
import toast from "react-hot-toast";
import notificationService from "../../services/notification.service";

const THEME_CONFIG = {
  user: {
    badge: 'bg-[#FFF9F4] text-[#C9653B] border border-[#E6E0DA]',
    header: 'bg-[#C9653B]',
    tabActive: 'text-[#C9653B] border-[#C9653B]',
    unreadDot: 'bg-[#C9653B]',
    button: 'bg-[#C9653B] hover:bg-[#b0552e] text-white',
    icon: User,
    label: 'User'
  },
  tenant: {
    badge: 'bg-[#F5F7FB] text-[#2F6FED] border border-[#E2E8F0]',
    header: 'bg-[#2F6FED]',
    tabActive: 'text-[#2F6FED] border-[#2F6FED]',
    unreadDot: 'bg-[#2F6FED]',
    button: 'bg-[#2F6FED] hover:bg-[#2458c7] text-white',
    icon: Building,
    label: 'Tenant'
  },
  admin: {
    badge: 'bg-[#F3F4F6] text-[#D4AF37] border border-[#E5E7EB]',
    header: 'bg-[#111827] border-b border-[#D4AF37]/30',
    tabActive: 'text-[#D4AF37] border-[#D4AF37]',
    unreadDot: 'bg-[#D4AF37]',
    button: 'bg-[#111827] hover:bg-[#1f2937] text-[#D4AF37] border border-[#D4AF37]/40',
    icon: Shield,
    label: 'Admin'
  }
};

interface NotificationWorkspaceProps {
  roleTheme?: 'user' | 'admin' | 'tenant';
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationWorkSpace: React.FC<NotificationWorkspaceProps> = ({ roleTheme = 'user', isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId,setMarkingId]=useState<string|null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const response = await notificationService.getAllNotifications();
          if (response.success && response.data) {
            setNotifications(response.data);
          } else {
            toast.error(response.message || 'Failed to retrieve notifications');
          }
        } catch {
          toast.error('Failed to fetch notifications');
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isOpen, roleTheme]);

  if (!isOpen) return null;

  const activeTheme = THEME_CONFIG[roleTheme] || THEME_CONFIG.user;
  const RoleIcon = activeTheme.icon;
  
  const handleMarkAsRead=async (notificationId:string)=>{
   setMarkingId(notificationId);
   try {
    const response=await notificationService.markAsRead(notificationId);
    if(response.success&&response.data){
      setNotifications((prev)=>
      prev.map((item)=>
        item.notificationId==notificationId?{...item,isRead:true}:item
      )
      )
    }
   } catch {
    toast.error('failed to mark as read')
   }finally{
    setMarkingId(null)
   }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case NotificationType.ERROR:
        return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case NotificationType.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

const formatDate = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

  const filteredNotifications = notifications.filter(item => {
    if (filter === 'unread') return !item.isRead;
    return true;
  });
  const hasUnread = notifications.some((item) => !item.isRead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        
        <div className={`${activeTheme.header} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold leading-none">Notifications</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${activeTheme.badge}`}>
                  <RoleIcon className="w-3 h-3" />
                  {activeTheme.label}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1">Updates and activity alerts</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 bg-slate-50 dark:bg-slate-900/50">
          {(['all', 'unread'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                filter === tab 
                  ? activeTheme.tabActive 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Body */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 min-h-[250px]">
          {loading ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
              <p className="text-xs font-medium">Fetching notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-slate-400">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.notificationId}
                className={`p-3.5 rounded-xl border transition-all flex gap-3 ${
                  !item.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 opacity-75'
                }`}
              >
                {getNotificationIcon(item.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${activeTheme.unreadDot}`} />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatDate(item.createdAt)}
                    </span>

                    {/* Individual Mark as Read Button */}
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.notificationId)}
                        disabled={markingId === item.notificationId}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                      >
                        {markingId === item.notificationId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3 h-3" />
                        )}
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs">
          
          {/* <button
            onClick={handleMarkAllAsRead}
            disabled={!hasUnread || markingAll}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              hasUnread && !markingAll
                ? 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {markingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            Mark all as read
          </button> */}

          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};