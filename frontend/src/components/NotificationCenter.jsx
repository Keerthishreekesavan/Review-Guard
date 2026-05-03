import React, { useState, useEffect, useRef } from 'react';
import { 
  RiNotification3Line, RiCheckLine, 
  RiCloseLine, RiTimeLine, RiRecordCircleFill, 
  RiFileTextLine, RiArrowRightSLine 
} from 'react-icons/ri';
import api from '../api/axios';

// Global memory bank to survive component remounts
let globalNotifications = [];

const NotificationCenter = ({ socket, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(globalNotifications);
  const [confirmClear, setConfirmClear] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        globalNotifications = res.data.map(n => ({
          id: n._id,
          reviewId: n.reviewId,
          type: n.type,
          title: n.title,
          message: n.message,
          status: n.status,
          timestamp: n.createdAt,
          unread: !n.isRead
        }));
        setNotifications(globalNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for real-time status updates via WebSockets
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      console.log('[NotificationCenter] New update received:', data);
      const newNotif = {
        id: Date.now(),
        reviewId: data.reviewId,
        type: 'status_update',
        title: 'Review Status Update',
        message: data.message,
        status: data.status,
        timestamp: new Date(),
        unread: true
      };
      globalNotifications = [newNotif, ...globalNotifications];
      setNotifications(globalNotifications);
    };

    socket.on('review:status-updated', handleStatusUpdate);

    // DEBUG: Listen to ALL events to see what's arriving
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket Debug] Heard event: "${eventName}"`, args);
    });

    // Also listen for local test events
    const handleLocal = (e) => handleStatusUpdate(e.detail);
    window.addEventListener('test-notif', handleLocal);

    return () => {
      socket.off('review:status-updated', handleStatusUpdate);
      window.removeEventListener('test-notif', handleLocal);
    };
  }, [socket]);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-as-read');
      globalNotifications = globalNotifications.map(n => ({ ...n, unread: false }));
      setNotifications(globalNotifications);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    // Persist read state to DB so it survives across sessions
    try {
      await api.patch(`/notifications/${notif.id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
    globalNotifications = globalNotifications.map(n => n.id === notif.id ? { ...n, unread: false } : n);
    setNotifications(globalNotifications);
    setIsOpen(false);
    if (onNotificationClick) onNotificationClick(notif.reviewId);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    console.log('[NotificationCenter] Component mounted, socket state:', socket?.connected);
  }, [socket?.connected]);

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      globalNotifications = [];
      setNotifications([]);
      setConfirmClear(false);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-surface-600'
        }`}
      >
        <RiNotification3Line className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-brand-500 border-2 border-surface-800 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-800 border border-surface-500 rounded-3xl shadow-2xl overflow-hidden animate-slide-up z-[60]">
          {/* Header */}
          <div className="p-5 border-b border-surface-500 flex items-center justify-between bg-surface-800/50">
            <h3 className="text-base font-bold text-white">Notifications</h3>
            <button 
              onClick={markAllAsRead}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Mark all as read
            </button>
          </div>

          {/* List Area */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <RiNotification3Line className="text-4xl text-slate-600 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-500/50">
                {notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`w-full p-4 flex gap-4 text-left transition-all hover:bg-white/5 active:bg-white/10 group relative ${
                      notif.unread ? 'bg-brand-500/[0.03]' : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {notif.unread && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                        <RiRecordCircleFill className="text-[10px] text-brand-500" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.status === 'approved' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      <RiFileTextLine className={`text-xl ${
                        notif.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'
                      }`} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-bold truncate ${notif.unread ? 'text-white' : 'text-slate-300'}`}>
                          {notif.title}
                        </p>
                        <RiArrowRightSLine className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <RiTimeLine />
                        {timeAgo(notif.timestamp)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-surface-500 bg-surface-800/50">
            {confirmClear ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-400 text-center">This action can't be undone. Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-600 hover:bg-surface-500 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    Yes, clear all
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
              >
                Clear all notifications
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
