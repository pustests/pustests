firebase.initializeApp(config);
var messaging = firebase.messaging();

// On load register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
      // Successfully registers service worker
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      messaging.useServiceWorker(registration);
    })
    .then(() => {
      // Requests user browser permission
      return messaging.requestPermission();
    })
    .then(() => {
      // Gets token
      return messaging.getToken();
    })
    .then((token) => {
      console.log('Token that is not sending anywhere', token);
      // Simple ajax call to send user token to server for saving
      // $.ajax({
      //   type: 'POST',
      //   url: '/api/setToken',
      //   dataType: 'json',
      //   data: JSON.stringify({token: token}),
      //   contentType: 'application/json',
      //   success: (data) => {
      //     console.log('Success ', data);
      //   },
      //   error: (err) => {
      //     console.log('Error ', err);
      //   }
      // })
    })
    .catch((err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
  }
