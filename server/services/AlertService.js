const Alert = require('../models/Alert');

class AlertService {
  async checkAlerts(tick) {
    const { symbol, price, volume } = tick;
    
    try {
      const activeAlerts = await Alert.find({ 
        symbol, 
        isActive: true, 
        isTriggered: false 
      });

      for (const alert of activeAlerts) {
        let isConditionMet = false;

        switch (alert.condition) {
          case 'GREATER_THAN':
            if (price >= alert.value) isConditionMet = true;
            break;
          case 'LESS_THAN':
            if (price <= alert.value) isConditionMet = true;
            break;
          case 'VOLUME_SPIKE':
            // Logic for volume spike (e.g., 2x average volume)
            if (volume >= alert.value) isConditionMet = true;
            break;
        }

        if (isConditionMet) {
          await this.triggerAlert(alert, tick);
        }
      }
    } catch (err) {
      console.error('Alert Engine Error:', err.message);
    }
  }

  async triggerAlert(alert, tick) {
    console.log(`ALERT TRIGGERED: ${alert.symbol} ${alert.condition} ${alert.value} (Current: ${tick.price})`);
    
    alert.isTriggered = true;
    alert.triggeredAt = new Date();
    await alert.save();

    // Mock Notification Channels
    if (alert.notificationChannels.email) {
      this.sendEmail(alert, tick);
    }
    if (alert.notificationChannels.sms) {
      this.sendSMS(alert, tick);
    }
    if (alert.notificationChannels.push) {
      this.sendPush(alert, tick);
    }
  }

  sendEmail(alert, tick) {
    console.log(`[EMAIL] To user ${alert.user}: Alert for ${alert.symbol} triggered at ${tick.price}`);
  }

  sendSMS(alert, tick) {
    console.log(`[SMS] To user ${alert.user}: Alert for ${alert.symbol} triggered at ${tick.price}`);
  }

  sendPush(alert, tick) {
    console.log(`[PUSH] To user ${alert.user}: Alert for ${alert.symbol} triggered at ${tick.price}`);
  }
}

module.exports = new AlertService();
