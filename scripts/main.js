/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BLoAlIV6PHr1SavjYNa-ZyWEqnp7aT9AwIYH0O2njuZWAE_vs1_StXeL3XpdFxJ8lPkCbaL1WEqFxS6EHUQPluA';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

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

if ('serviceWorker' in navigator && 'PushManager' in window) {
  debugger;
  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    swRegistration = swReg;
    initialiseUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  pushButton.textContent = 'Уведомления не поддерживаются :/';
}

function initialiseUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);


    updateBtn();
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

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
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

    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    const subscriptionData = JSON.stringify(subscription);
    subscriptionJson.textContent = subscriptionData;
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Уведомления заблокированы.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Отлючить PUSH-уведомления';
  } else {
    pushButton.textContent = 'Включить PUSH-уведомления';
  }

  pushButton.disabled = false;
}

function sendSubscriptionInfoToServer(subscription) {
  var xhr = new XMLHttpRequest();
  var url = "http://shtorin-001-site1.gtempurl.com/Subscribtions/Subscribe";
  var data = subscription;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type","application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          // do something with response
          console.log(xhr.responseText);
      }
 };
 xhr.send(data);
}

function sendSubscriptionInfoToServerWithGet(subscription){
  var xhr = new XMLHttpRequest();
  const url = "http://shtorin-001-site1.gtempurl.com/Subscribtions/SubscribeGet";
  const fullUrl = `${url}?endpoint=${subscription.endpoint}`;
  xhr.open("GET", fullUrl, true);
  xhr.onreadystatechange = function () { 
      if (xhr.readyState == 4 && xhr.status == 200) {
           console.log(xhr.responseText);
      }
  }
  xhr.send();  
}

