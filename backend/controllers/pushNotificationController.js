const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

let vapidConfigured = false;

const configureVapid = () => {
  if (!vapidConfigured && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:admin@dialforhelp.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    vapidConfigured = true; 
    console.log('VAPID configured for push notifications');
  }
};

const subscribe = async (req, res) => {
  try {
    configureVapid(); // Ensure VAPID is configured
    
    const { subscription, service, district } = req.body;
    const userId = req.user.userId;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data'
      });
    }

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      userId,
      endpoint: subscription.endpoint
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.keys = subscription.keys;
      existingSubscription.service = service;
      existingSubscription.district = district;
      existingSubscription.active = true;
      await existingSubscription.save();

      return res.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    }

    // Create new subscription
    await PushSubscription.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      service,
      district
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed to push notifications successfully'
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
      error: error.message
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.userId;

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint },
      { active: false }
    );

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error.message
    });
  }
};

const getPublicKey = (req, res) => {
  configureVapid(); // Ensure VAPID is configured
  
  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
};

const sendNotification = async (subscription, payload) => {
  try {
    configureVapid(); // Ensure VAPID is configured
    
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    
    // If subscription is no longer valid, mark as inactive
    if (error.statusCode === 410 || error.statusCode === 404) {
      await PushSubscription.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        { active: false }
      );
    }
    
    return { success: false, error: error.message };
  }
};

const sendToMatchingWorkers = async (service, district, payload) => {
  try {
    const subscriptions = await PushSubscription.find({
      active: true,
      service: service,
      district: district
    });

    console.log(`Sending push notifications to ${subscriptions.length} workers`);

    const promises = subscriptions.map(sub => 
      sendNotification({
        endpoint: sub.endpoint,
        keys: sub.keys 
      }, payload)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      success: true,
      sent: successful,
      failed: failed
    };

  } catch (error) {
    console.error('Send to matching workers error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getPublicKey,
  sendNotification,
  sendToMatchingWorkers
};