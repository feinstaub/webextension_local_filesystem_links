import * as CONSTANTS from './common/constants';
const matchPattern = require('match-pattern');
// const CONSTANTS = require('./common/constants');

const {defaultSettings} = CONSTANTS;
// const whitelist = ['*']; //['http://127.0.0.1:3000/*', '*://*.localhost/*', '*://*.google.de/*', '*://*.trello.com/*'];

let activeTab = null;
let injectedTabs = false; // check if we injected content scripts before

console.log('hello from background');

var CAKE_INTERVAL = 0.1;
var cakeNotification = 'webextension-local-filesystem-links-notification';

// browser.alarms.create('', {periodInMinutes: CAKE_INTERVAL});
// notify(undefined, 'just a test');

function checkUrls() {
    browser.storage.local.get().then(onSettingsLoaded);

    // helpers
    const prepareWhitelist = (whitelist) =>  whitelist && whitelist.
      split(' '). // spacing char --> later add , and ;
      map((url) => {
          // remap * to all urls
          return url === '*' ?
            '<all_urls>' : url;
      });

    function onSettingsLoaded(settings) {
        console.log('settings loaded', settings);
        const whitelist = prepareWhitelist(settings.whitelist ||
          defaultSettings.whitelist);

        console.log('whitelist loaded', whitelist, CONSTANTS.MESSAGES);

        browser.tabs.query({
            active: true,
            lastFocusedWindow: true,
            url: whitelist}).then(function(tabs) {
                console.log('query matched', tabs);
                if (!tabs) {
                    return; // no match
                }

                var activeTab = tabs.filter(tab => tab.active)[0];

                //
                if (!activeTab) {
                    return; // no tab active --> e.g. about:addons
                }

                console.log('stored tabs', injectedTabs);
                if (!injectedTabs) {
                    // launching content script
                    console.log('launch content script for active tab', tabs,
                      activeTab);

                    // console.log('current locale', browser.i18n.getUILanguage());
                    // inject css
                    // --> defaults to activetab
                    browser.tabs.insertCSS(null,
                        {
                            // runAt: 'document_start',
                            allFrames: true,
                            file: 'css/self-hosted-materialize.css'
                        });
                    browser.tabs.insertCSS(null,
                        {
                            // runAt: 'document_start',
                            allFrames: true,
                            file: 'css/style.css'
                        });

                    // inject scripts
                    // --> defaults to activetab
                    browser.tabs.executeScript(null,
                        {allFrames: true, file: 'js/jquery-1.11.3.min.js'});
                    browser.tabs.executeScript(null,
                        {allFrames: true, file: 'js/jquery-observe.js'});
                    browser.tabs.executeScript(null,
                        {
                            allFrames: true,
                            file: './content.js'
                        }).then(function() {
                            // content script loaded --> now we can send init data
                            injectedTabs = true;
                            browser.tabs.sendMessage(activeTab.id, {
                                action: 'init',
                                data: {
                                    options: {
                                        enableLinkIcons: true,
                                        revealOpenOption: 'O'
                                    },
                                    constants: CONSTANTS
                                }
                            });
                            // , function(response) {
                            //     console.log('content script callback', CONSTANTS,
                            //       response);
                            //     // console.log(response.farewell); // not needed here
                            // });
                        });
                }
            }).catch(onError);
    }
}

function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {action: 'update'}
        ).then(response => {
            console.log('Message from the content script:');
            console.log(response.response);
        }).catch(onError);
    }
}

// add message handling
browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.action) {
        case 'open':
            console.log('Last error:', browser.runtime.lastError);
            // console.log(sender.tab ?
            //             'from a content script:' + sender.tab.url :
            //             'from the extension', request.url);

            console.log('reveal', request.reveal ? 1 : 0);
            var uri = request.url;

            notify(undefined, 'Clicked url: ' + request.url); // todo --> not translated yet
            // if (request.greeting == 'hello') {
            //   sendResponse({farewell: 'goodbye'});
            //   // return true;
            // }
            // sendNativeMessage(request.url); // with open connection

            // console.log('sendNativeMessage...', {
            //     'url': uri, 'reveal': request.reveal, 'exeAllowed': 0});
            // browser.extension.sendNativeMessage( // direct sending --> opens port to native app
            browser.runtime.sendNativeMessage( // direct sending --> opens port to native app
                'webextension_local_filesystem_links',
                {'url': uri, 'reveal': request.reveal, 'exeAllowed': 0}).
                // {'url': uri, 'reveal': 0, 'exeAllowed': 0},
                    then(function(response) {
                        if (response && response.error) {
                            const msg = browser.i18n.
                              getMessage(response.error);

                            console.log('Received response - ', response, msg);
                            notify('Error', msg); // only NotFound error at the moment
                        }
                    }).catch(onError);
            //launcher.start(request.url, false);
            break;
        case 'updateContentPages':
            console.log('trigger content page update');
            browser.tabs.query({
                currentWindow: true,
                //active: true
            }).then(sendMessageToTabs).catch(onError);
            break;
        default:
        }
    });

browser.tabs.onActivated.addListener(() => {
    console.log('tab activated');
    checkUrls();
});

let notifyCount = 0;

function notify(title, message) {
    notifyCount++;
    const id = `${cakeNotification}-${notifyCount}`;

    // console.log(id, title, message,
    //   browser.extension.getURL('img/active_icon_64.png'));
    browser.notifications.create(
        id,
        {
            'type': 'basic',
            'iconUrl': browser.extension.getURL('img/active_icon_64.png'),
            'title': title || browser.i18n.getMessage('app_name'),
            'message': message
        }).then(() => {
            // console.log('cake created', arguments);
            setTimeout(() => {
                // console.log('cake cleared');
                browser.notifications.clear(id);
            }, 2000);
        });
}

// browser.tabs.onActivated.addListener((activeInfo) => {
//     console.log('active tab changed', activeInfo);
//     // if (activeInfo.status === 'complete') {
//     checkUrls();
//     // }
// });

let urlMap = [];

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log('on update', changeInfo);
    injectedTabs = false;
    // if (changeInfo.status && changeInfo.status === 'loading' &&
    //   changeInfo.url !== undefined) {
    //     console.log('changed url', changeInfo.url);
    //     urlMap[tabId] = true;
    // } else if (urlMap[tabId] &&

    if (changeInfo.status && changeInfo.status === 'complete' &&
      tab.active) {
        // urlMap[tabId] = false;
        notify(null, 'loaded tab');
        checkUrls();
    }
//     // if (changeInfo.status === 'loading') {
//     //     console.log('loading', changeInfo.url);
//     //     urlMap[tabId] = !!changeInfo.url;
//     //             // the tab just changed url
//     // } else if (urlMap[tabId] && changeInfo.status === 'complete') {
//     //     urlMap[tabId] = false;
//     //     // the tab loaded the new url and changeInfo.url == 'undefined'
//     //     notify('loaded', 'loaded tab');
//     //     checkUrls();
//     // }
//     // if (changeInfo.status == 'loading' && changeInfo.url != undefined) {
//     //     urlMap[tabId] = true;
//     //     // the tab just changed url
//     // } else if (urlMap[tabId] && changeInfo.status == 'complete') {
//     //     urlMap[tabId] = false; // && tab.active
//         // the tab loaded the new url and changeInfo.url == undefined
//         // tab loadied and active and url changed --> execute sctipt
//
//         // var clearing = browser.notifications.clear(cake_notification);
//         // clearing.then(() => {
//         //   console.log('cleared');
//         // });
//     // }
});


function onError(err) {
    console.log('error handler:', err);
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
