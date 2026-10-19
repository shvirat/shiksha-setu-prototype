const { Notification, User } = require('../models');

class NotificationService {
  /**
   * Send notification to user (creates in-app Notification and dispatches stubbed channels)
   */
  async sendNotification({ userId, type, title, message, messageHi = '', metadata = {} }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        messageHi: messageHi || message,
        metadata,
        readAt: null
      });

      // Find user contact info for multichannel stub dispatch
      const user = await User.findById(userId).select('name email mobile language');
      if (user) {
        this.dispatchSMS({ mobile: user.mobile, text: message });
        this.dispatchWhatsApp({ mobile: user.mobile, text: message });
        this.dispatchEmail({ email: user.email, subject: title, body: message });
      }

      return notification;
    } catch (err) {
      console.error('[NotificationService] Error creating notification:', err.message);
      return null;
    }
  }

  // Stubbed SMS dispatch interface
  dispatchSMS({ mobile, text }) {
    console.log(`[NotificationService:SMS] To: ${mobile} | Message: "${text}"`);
  }

  // Stubbed WhatsApp dispatch interface
  dispatchWhatsApp({ mobile, text }) {
    console.log(`[NotificationService:WhatsApp] To: ${mobile} | Template: "${text}"`);
  }

  // Stubbed Email dispatch interface
  dispatchEmail({ email, subject, body }) {
    console.log(`[NotificationService:Email] To: ${email} | Subject: "${subject}" | Body: "${body}"`);
  }
}

module.exports = new NotificationService();
