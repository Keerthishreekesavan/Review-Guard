const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markOneAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, markOneAsRead, clearAll };
