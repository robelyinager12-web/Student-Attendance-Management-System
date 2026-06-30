const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { Notification } = require('../models');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return success(res, 200, 'Notifications fetched successfully', { notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
  if (!notification) return error(res, 404, 'Notification not found');

  await notification.update({ isRead: true });

  return success(res, 200, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  return success(res, 200, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
  if (!notification) return error(res, 404, 'Notification not found');

  await notification.destroy();

  return success(res, 200, 'Notification deleted successfully');
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };