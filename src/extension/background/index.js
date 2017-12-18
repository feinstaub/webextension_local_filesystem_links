import * as CONSTANTS from '../constants';
import checkInstallation, {showInstallationTab} from './checkInstallation';
import notify from './notify';
const matchPattern = require('match-pattern');
const {defaultSettings} = CONSTANTS;
// const whitelist = ['*']; //['http://127.0.0.1:3000/*', '*://*.localhost/*', '*://*.google.de/*', '*://*.trello.com/*'];

let activeTab = null;
let injectedTabs = [];
var glbSettings = {};

function updateAddonbarIcon(status) {
    // todo move to separate file as helper (less code here)
    const filePrefix = status ? 'active' : 'inactive';
    const i18nKey = 'LABEL_ADDONBAR_HOVER_STATE_' + filePrefix;
    const statusText = browser.i18n.getMessage(i18nKey);

    // update title
    browser.browserAction.setTitle({
        title: browser.i18n.getMessage('LABEL_ADDONBAR_ICON_HOVER', statusText)
    });

    // update icon
    browser.browserAction.setIcon({
        path: {
            '16': 'img/' + filePrefix + '_icon_16.png',
            '32': 'img/' + filePrefix + '_icon_32.png',
        }
    });
}

function checkUrls() {
    browser.storage.local.get().then(onSettingsLoaded);

    // helpers
    const prepareWhitelist = (whitelist) => whitelist && whitelist.
      split(' '). // spacing char --> later add , and ;
      map((url) => {
          // remap * to all urls
          return url === '*' ?
            '<all_urls>' : url;
      });

    function onSettingsLoaded(settings) {
        // console.log('settings loaded', settings, glbSettings.whitelist);
        glbSettings = Object.assign({}, defaultSettings, settings);
        const whitelist = glbSettings.whitelist.trim() ?
          prepareWhitelist(glbSettings.whitelist.trim()) : [];

        // console.log('whitelist=', whitelist, glbSettings.whitelist);
        // console.log('whitelist loaded', glbSettings, CONSTANTS.MESSAGES);

        browser.tabs.query({
            active: true,
            lastFocusedWindow: true,
            url: whitelist}).then(function(tabs) {
                // console.log('query matched', tabs);
                if (!tabs) {
                    return; // no match
                }

                var activeTab = tabs.filter(tab => tab.active)[0];

                //
                if (!activeTab) {
                    // console.log('no active tab');
                    //unloadContentScript();
                    browser.tabs.query({active: true,
                        windowId: browser.windows.WINDOW_ID_CURRENT}).
                      then(tabs => browser.tabs.get(tabs[0].id)).
                      then(tab => {
                          console.info(tab);
                          // injectedTabs.pop(tab.id);
                          browser.tabs.sendMessage(tab.id, {
                              action: 'destroy'
                          }).catch(() => {}); // ignore errors (no content script available)
                      });
                    return; // no tab active --> e.g. about:addons
                }

                // show enhancement at addon bar icon
                updateAddonbarIcon(true);
                // launching content script
                // console.log('launch content script for active tab', tabs,
                //   activeTab);

                // console.log('current locale', browser.i18n.getUILanguage());
                // inject css
                // --> defaults to activetab
                if (injectedTabs.indexOf(activeTab.id) > -1) {
                    // already added scripts & css
                    return;
                }

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
                        browser.tabs.sendMessage(activeTab.id, {
                            action: 'init',
                            data: {
                                options: {
                                    enableLinkIcons: glbSettings.
                                      enableLinkIcons,
                                    revealOpenOption: glbSettings.
                                      revealOpenOption
                                },
                                constants: CONSTANTS
                            }
                        });
                        injectedTabs.push(activeTab.id); // add id to keep track of js adding.
                    });
                // }
            }).catch(onError);
    }
}

// add message handling
browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.action) {
        case 'showInstallInfoTab':
            showInstallationTab();
            // sendResponse({info: 'tab created'});
            break;
        case 'open':
            var uri = request.url;

            if(request.directOpen) {
                // setting commented at the moment --> re-add later
                browser.tabs.create({
                    active: true,
                    url: window.decodeURI(uri) // illegal URL --> not priveleged to add file:// - fix later
                });
            } else {
                browser.runtime.sendNativeMessage( // direct sending --> opens port to native app
                    'webextension_local_filesystem_links',
                    {
                        'url': uri, 'reveal': request.reveal,
                        'exeAllowed': glbSettings.enableExecutables
                    }).
                  // {'url': uri, 'reveal': 0, 'exeAllowed': 0},
                      then(function(response) {
                          // console.log('response', response);
                          if (response && response.error) {
                              const msg = browser.i18n.
                                getMessage(response.error,
                                  window.decodeURI(response.url));

                              // console.log('Received response - ',
                              //   response, msg);
                              notify('Error', msg); // only NotFound error at the moment
                          }
                      }).catch(onError);
            }
            break;
        default:
        }
    });

browser.tabs.onActivated.addListener(() => {
    // notify('dummy', 'just a test');
    // console.log('tab activated');
    // console.log('tab activated', injectedTabs);
    updateAddonbarIcon(false); // always toggle to inactive
    checkUrls();
});

let urlMap = [];

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // console.log('on update', changeInfo);
    if(changeInfo.status && changeInfo.status === 'loading') {
        // console.log('loading --> remove id', tab.id);
        injectedTabs.pop(tab.id);
    }

    if (changeInfo.status && changeInfo.status === 'complete' &&
      tab.active) {
        // urlMap[tabId] = false;
        // notify(null, 'loaded tab'); // just for debugging
        checkUrls();
    }
});


function onError(err) {
    // console.log('error handler:', err.name, err.message, err.stack,
      // err.lineNumber); // todo - check that really the connection to the native app isn't open
    const nativeAppNotInstalled = err.message.includes('disconnected port') ?
     ' Please check that you ' +
     'have installed the native app. See installation guide in addon-bar ' +
     'menu.' : '';

    notify(err.name, err.message + '.' + nativeAppNotInstalled);
}

browser.runtime.onInstalled.addListener((details) => {
    checkInstallation(details, notify);
});
