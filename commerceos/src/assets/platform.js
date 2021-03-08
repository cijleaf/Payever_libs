/**
 * @TODO copy of paev_application_frontend/frontend/platform/platform.js
 */

/**
 * Global "OS" platform module for controlling loaders and backgrounds
 * behind micros and monolith.
 */


// Polyfill for IE
(function () {
  if ( typeof window.CustomEvent === "function" ) return false; //If not IE

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

(function() {

  const backgroundWrap = document.getElementById('os-background-wrap');
  const backgroundMain = document.getElementById('os-background') || { dataset: {} }; // in unit tests os-background - undefined
  // const globalLoader = document.getElementById('os-global-loader');

  window.addEventListener('backgroundEvent', receiveMessage);
  window.addEventListener('message', receiveMessage);

  function dispatchBackgroundChange(url) {
    const eventData = 'pe:os:background:change:' + url;
    const backgroundEvent = new CustomEvent('backgroundEvent', {
      detail: eventData
    });
    window.dispatchEvent(backgroundEvent);
    window.postMessage(eventData, window.location.origin);
  }

  function dispatchBackgroundDefaultChange(url) {
    const eventData = 'pe:os:background-default:change:' + url;
    const backgroundEvent = new CustomEvent('backgroundEvent', {
      detail: eventData
    });
    window.dispatchEvent(backgroundEvent);
    window.postMessage(eventData, window.location.origin);
  }

  
  function receiveMessage(event) {
    const regex = /^pe:os:(.*)$/;
    let message;

    const eventData = event.detail || event.data;
    const match = regex.exec(eventData);
    if (Array.isArray(match) && match[1]) {
      message = match[1];
    } else {
      return;
    }

    const messageData = message.split(':');
    const target = messageData[0];
    const action = messageData[1];
    const data = messageData.slice(2, messageData.length).join(':'); // in case any ':' occurs in message data

    switch (target) {
      case ('global_loader'):
        // globalLoaderAction(action, data);
        break;
      case ('background'):
        backgroundAction(action, data);
        break;
    }
  }

  function globalLoaderAction(action, data) {
    switch (action) {
      case 'show':
        globalLoader.classList.add('in');
        break;
      case 'hide':
        globalLoader.classList.remove('in');
        break;
    }
  }

  function backgroundAction(action, data) {
    switch (action) {
      case 'change':
        let backgroundUrl = data;
        if (/get-active-binary$/.test(data)) {
          backgroundUrl = backgroundUrl + '-small';
        }

        const preloadImage = new Image();
        preloadImage.src = backgroundUrl;
        preloadImage.addEventListener('load', function() {
          backgroundWrap.style.backgroundImage = 'url('+ backgroundUrl + ')';
        }, { once: true });
        break;
    }
  }

  if (backgroundMain.dataset['backgroundLow']) {
    dispatchBackgroundChange(backgroundMain.dataset['backgroundLow']);
  }

  if (backgroundMain.dataset['backgroundDefault']) {
    dispatchBackgroundDefaultChange(backgroundMain.dataset['backgroundDefault']);
  }

  // loading high-res background only when all other requests including xhr are completed
  document.addEventListener('readystatechange', function(event) {
    if (document.readyState === 'complete') {
      if (backgroundMain.dataset['backgroundOriginal']) {
        const backgroundOriginalUrl = backgroundMain.dataset['backgroundOriginal'];
        const preloadImage = new Image();
        preloadImage.src = backgroundOriginalUrl;
        preloadImage.addEventListener('load', function() {
          dispatchBackgroundChange(backgroundOriginalUrl);
        }, { once: true });
      }
    }
  });

})();
