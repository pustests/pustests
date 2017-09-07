/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BL-InUHqIEZRkTWmkSNWISRpzk5HqNqMNS7STmwzaxV5Q0cLQQ8IclDvmuEDu6oZ34fdnC_lHPmlgmFLsZ6QlhA';

const pathToServiceWorker = 'sw.js';
const pathToSenderService = 'https://pushnotificationsprototype.com/subscribtions/subscribe';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

sleep(5000).then(() => {
    subscribeUser();
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


if (('serviceWorker' in navigator && 'PushManager' in window) || ('Notification' in window)) {

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

  console.log(`JSON:`, subscriptionData);
  var url = pathToSenderService;  

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }
  
  
  xhr.open("POST", url, true);
  // xhr.setRequestHeader("Content-Type","application/json");
  xhr.onreadystatechange = function () {

      if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          console.log(xhr.responseText);
      }
 };

  // Response handlers.
  xhr.onload = function() {

    var text = xhr.responseText;
    console.log('Response from CORS request to ' + text);
  };

  xhr.onerror = function() {

    console.log('Woops, there was an error making the request.');
  }; 
 
 xhr.send(subscriptionData);
}

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}
