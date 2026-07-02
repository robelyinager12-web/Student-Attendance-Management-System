import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { notificationService } from '../../services/notification.service';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatDateTime } from '../../utils/formatDate';
import {
  MdNotifications,
  MdDoneAll,
  MdDelete,
  MdCircle,
} from 'react-icons/md';

const typeColors = {
  ATTENDANCE: 'bg-blue-100 text-blue-700',
  LOW_ATTENDANCE: 'bg-red-100 text-red-700',
  STUDENT: 'bg-green-100 text-green-700',
  TEACHER: 'bg-purple-100 text-purple-700',
  PASSWORD: 'bg-yellow-100 text-yellow-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  }

  async function handleDelete(id) {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications' },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs
              font-bold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm
              font-medium text-indigo-600 hover:bg-indigo-50
              dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            <MdDoneAll size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500
            border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 p-16 text-center">
          <MdNotifications size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-100 dark:border-gray-700 divide-y
          divide-gray-100 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 transition-colors
                ${!notification.isRead
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {!notification.isRead ? (
                  <MdCircle size={10} className="text-indigo-600" />
                ) : (
                  <MdCircle size={10} className="text-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium
                      ${!notification.isRead
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium ${typeColors[notification.type] || typeColors.SYSTEM}`}>
                        {notification.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 rounded-lg text-indigo-600
                          hover:bg-indigo-100 dark:hover:bg-indigo-900/30
                          transition-colors"
                        title="Mark as read"
                      >
                        <MdDoneAll size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 rounded-lg text-red-500
                        hover:bg-red-50 dark:hover:bg-red-900/20
                        transition-colors"
                      title="Delete"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;