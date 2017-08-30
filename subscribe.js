/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BL-InUHqIEZRkTWmkSNWISRpzk5HqNqMNS7STmwzaxV5Q0cLQQ8IclDvmuEDu6oZ34fdnC_lHPmlgmFLsZ6QlhA';

const pathToServiceWorker = '/sw.js';
const pathToSenderService = 'http://shtorin-001-site1.gtempurl.com/subscribtions/subscribe';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

sleep(500).then(() => {
  startSubscriptionProcess();
});

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function startSubscriptionProcess() {
  if (('serviceWorker' in navigator && 'PushManager' in window) || ('Notification' in window)) {
    debugger;
    navigator.serviceWorker.register(pathToServiceWorker)
    .then(function(swReg) {
      swRegistration = swReg;
      initialiseUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.log('Уведомления не поддерживаются :/');
  }
}

function initialiseUI() {
  subscribeUser();

  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);
  });
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;
  });
}

function updateSubscriptionOnServer(subscription) {

  if (subscription) {
    const subscriptionData = JSON.stringify(subscription);

    sendSubscriptionInfoToServer(subscriptionData);
  } else {
    console.errorg('Subscription is empty');    
  }
}

function sendSubscriptionInfoToServer(subscriptionData) {  
  var data = btoa(subscriptionData);  
  var xhr = new XMLHttpRequest();
  var url = pathToSenderService;
  console.log(`URL GET: ${url}?base64Request=${data}`);
  
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type","text/plain");
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          console.log(xhr.responseText);
      }
 };
 xhr.send(data);
}

