/* eslint-env browser, serviceworker, es6 */

'use strict';

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
    console.log(event);

    const pushData = JSON.parse(event.data.text());
    console.log('title', pushData.title, 'text', pushData.text);

    const title = `${pushData.title}`;
    const options = {
      body: pushData.text,
      icon: 'images/icon.png',
      badge: 'images/badge.png',
      data: pushData.url,
    };
  
    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
  });

  self.addEventListener('notificationclick', function(event) {
    console.log('Event:', event);
    event.notification.close();
  
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  });