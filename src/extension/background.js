const matchPattern = require('match-pattern');
const CONSTANTS = require('./common/constants');

const whitelist = ['']; //['http://127.0.0.1:3000/*', '*://*.localhost/*', '*://*.google.de/*', '*://*.trello.com/*'];

let port = null;
let activeTab = null;

console.log('hello from background');

// var CAKE_INTERVAL = 0.1;
var cakeNotification = 'test-notify';

// browser.alarms.create(', {periodInMinutes: CAKE_INTERVAL});

function checkUrls() {
    browser.storage.local.get().then(onSettingsLoaded);

    // helpers
    const prepareWhitelist = (whitelist) =>  whitelist.
      split(' '). // spacing char --> later add , and ;
      map((url) => {
          // remap empty url or * to all urls
          return url === '' || url === ' ' || url === '*' ?
            '<all_urls>' : url;
      });

    function onSettingsLoaded(settings) {
        console.log('settings loaded', settings);
        console.log(prepareWhitelist(settings.whitelist));
        browser.tabs.query({
            active: true,
            lastFocusedWindow: true,
            url: prepareWhitelist(settings.whitelist)}).then(function(tabs) {
            // console.log(matchedTabs)
                if (!tabs) {
                    return; // no match
                }

                var activeTab = tabs.filter(tab => tab.active)[0];

                // launching content script
                console.log('launch content script for active tab', tabs);
                browser.tabs.sendMessage(activeTab.id, {
                    action: 'init',
                    data: {enableLinkIcons: true}
                }).then(function(response) {
                    console.log('init done', response);
                    // console.log(response.farewell); // not needed here
                }).catch(onError);

                // inject css
                // --> defaults to activetab
                browser.tabs.insertCSS(null,
                    {
                        runAt: 'document_start', allFrames: true,
                        file: 'css/self-hosted-materialize.css'
                    });
                browser.tabs.insertCSS(null,
                    {
                        runAt: 'document_start', allFrames: true,
                        file: 'css/style.css'
                    });

                // inject scripts
                // --> defaults to activetab
                browser.tabs.executeScript(null,
                    {file: 'js/jquery-1.11.3.min.js'});
                browser.tabs.executeScript(null,
                    {file: 'js/jquery-observe.js'});
                browser.tabs.executeScript(null,
                    {file: './content.js'}).then(function() {
                        browser.tabs.sendMessage(activeTab.id, {
                            action: 'init',
                            data: {
                                options: {
                                    enableLinkIcons: true,
                                    revealOpenOption: 'O'
                                },
                                constants: CONSTANTS
                            }
                        }
                        , function(response) {
                            console.log('content script callback', response);
                            // console.log(response.farewell); // not needed here
                        });
                    });
            }).catch(onError);
    }
}

// add message handling
browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('Last error:', browser.runtime.lastError);
        console.log(sender.tab ?
                    'from a content script:' + sender.tab.url :
                    'from the extension', request.url);

        console.log('reveal', request.reveal ? 1 : 0);
        var uri = request.url;

        notify('link clicked', 'url: ' + request.url);
        // if (request.greeting == 'hello') {
        //   sendResponse({farewell: 'goodbye'});
        //   // return true;
        // }
        // sendNativeMessage(request.url); // with open connection

        console.log({'url': uri, 'reveal': request.reveal, 'exeAllowed': 0});
        // browser.extension.sendNativeMessage( // direct sending --> opens port to native app
        browser.runtime.sendNativeMessage( // direct sending --> opens port to native app
            'webextension_local_filesystem_links',
            {'url': uri, 'reveal': request.reveal, 'exeAllowed': 0}).
            // {'url': uri, 'reveal': 0, 'exeAllowed': 0},
                then(function(response) {
                    console.log('Received response - ', response);
                    if (response && response.error) {
                        notify('Errror', browser.i18n.
                          getMessage(response.error)); // only NotFound error at the moment
                    }
                }).catch(onError);
        //launcher.start(request.url, false);
    });

browser.tabs.onActivated.addListener(() => {
    console.log('tab activated');
    checkUrls();
});

let notifyCount = 0;

function notify(title, message) {
    notifyCount++;
    console.log(cakeNotification + notifyCount, title, message);
    browser.notifications.create(
    cakeNotification + notifyCount, {
        type: 'basic',
        iconUrl: 'logo.png',
        title: title,
        message: message
    },

    function() {
        setTimeout(() => {
            browser.notifications.clear(cakeNotification + notifyCount);
        }, 2000);
    });
}

// browser.tabs.onCompleted.addListener((tabId, changeInfo, tab) => {
//   console.log('loaded');
//   checkUrls();
// })

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        notify('loaded', 'loaded tab');
        checkUrls();

        // var clearing = browser.notifications.clear(cake_notification);
        // clearing.then(() => {
        //   console.log('cleared');
        // });
    }
});


function onError(err) {
    console.log(err);
}

// messaging to native app for launching file explorer

// function onNativeMessage(message) {
//   // appendMessage('Received message: <b>' + JSON.stringify(message) + '</b>');
//   console.log('Received', message)
// }

// function onDisconnected() {
//   console.log('Failed to connect: ' + browser.runtime.lastError.message);
//   // appendMessage('Failed to connect: ' + browser.runtime.lastError.message);
//   port = null;
//   // updateUiState();
// }

// function connect() {
//   var hostName = 'webextension-local-filesystem-links';
//   // appendMessage('Connecting to native messaging host <b>' + hostName + '</b>')
//   console.log('Connecting to native messaging host <b>' + hostName + '</b>')
//   port = browser.runtime.connectNative(hostName);
//   port.onMessage.addListener(onNativeMessage);
//   port.onDisconnect.addListener(onDisconnected);
//   // updateUiState();
// }

/*function sendNativeMessage(url) {
  // message = 'Hello world' //{'text': document.getElementById('input-text').value};
  port.postMessage({'text': url});
 // appendMessage('Sent message: <b>' + JSON.stringify(message) + '</b>');
}*/


// document.addEventListener('DOMContentLoaded', function () {
//   // document.getElementById('connect-button').addEventListener(
//   //     'click', connect);
//   setTimeout(function () {
//     if (!port) connect();
//   }, 0);
// });
