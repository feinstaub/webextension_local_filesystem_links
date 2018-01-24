import * as CONSTANTS from '../constants';
import checkInstallation from './checkInstallation';
import {updateAddonbarIcon} from './addonbarIcon';
import {ExtensionEventHandlers} from './EventHandlers';

/** Main background script class of the extension */
class LocalFileSystemExtension {
    /** Initialize the extension
      */
    constructor() {
        this.settings = {};
        this.injectedTabs = [];
        this.eventHandlers = new ExtensionEventHandlers(this.settings);

        this.addListeners();
    }

    /** Add eventlisteners of the extension
      * @returns {undefined}
      */
    addListeners() {
        // add message handling
        browser.runtime.onMessage.addListener(this.eventHandlers.onMessage.
          bind(this));

        browser.tabs.onActivated.addListener(() => {
            updateAddonbarIcon(false); // always toggle to inactive
            this.checkUrls();
        });

        browser.tabs.onRemoved.addListener((tabId, /*removeInfo*/) => {
            this.injectedTabs.pop(tabId);
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if(changeInfo.status && changeInfo.status === 'loading' && tab.active) {
                // console.log('loading', tabId, tab.active);
                this.injectedTabs.pop(tabId);
            }

            if (changeInfo.status && changeInfo.status === 'complete' &&
              tab.active) {
                console.log('complete');
                this.checkUrls();
            }
        });

        // check if first installation or update
        browser.runtime.onInstalled.addListener(checkInstallation);
    }

    /** Check the urls (if active tab is whitelisted)
      * @returns {undefined}
      */
    checkUrls() {
        // load settingss from local storage
        browser.storage.local.get().then((settings) =>
          this.eventHandlers.onSettingsLoaded(settings, this.loadExtension.
            bind(this)));
    }

    /** Insert CSS into page
      * @returns {undefined}
      */
    injectCSS() {
        browser.tabs.insertCSS(null,
            {
                allFrames: true,
                file: 'css/self-hosted-materialize.css'
            });
        browser.tabs.insertCSS(null,
            {
                allFrames: true,
                file: 'css/style.css'
            });
    }

    /** Insert JavaScript into page
      * @param {object} activeTab the currently active tab
      * @returns {undefined}
      */
    injectScripts(activeTab) {
        // inject scripts
        // --> defaults to activetab
        const execute = browser.tabs.executeScript; // short-hand
        
        execute(null, {allFrames: true, file: 'js/jquery-2.2.4.min.js'}).then(() => 
            execute(null, {allFrames: true, file: 'js/jquery-observe.js'})).then(()=>
                execute(null, {allFrames: true, file: './content.js'})).then(() => {
                    // jquery & content script loaded --> now we can send init data
                    const settings = this.settings;

                    browser.tabs.sendMessage(activeTab.id, {
                        action: 'init',
                        data: {
                            options: {
                                enableLinkIcons: settings.
                                    enableLinkIcons,
                                revealOpenOption: settings.
                                    revealOpenOption
                            },
                            constants: JSON.parse(JSON.stringify(CONSTANTS)) // Parse / stringify needed in FF 54 --> otherwise constants.MESSAGES were undefined
                        }
                    });
                    this.injectedTabs.push(activeTab.id); // add id to keep track of js adding.
                    console.log('injected scripts', this.injectedTabs);
                });
    }

    /** Load the extension if query matches whitelist
      * @param {object} settings loaded app settings
      * @param {array} whitelist contains urls that are whitelisted
      * @returns {undefined}
      */
    loadExtension(settings, whitelist) {
        const excludeFileExtensions = ['.xml'];

        // set settings
        this.settings = settings;

        const queryCallback = (tabs) => {
            if (!tabs) {
                return; // no match
            }

            const activeTab = tabs.filter(tab => tab.active)[0];

            //
            if (!activeTab) {
                console.log('no active tab');
                //unloadContentScript();
                browser.tabs.query({active: true,
                    windowId: browser.windows.WINDOW_ID_CURRENT}).
                  then(tabs => browser.tabs.get(tabs[0].id)).
                  then(tab => {
                      // injectedTabs.pop(tab.id);
                      browser.tabs.sendMessage(tab.id, {
                          action: 'destroy'
                      }).catch(() => {}); // ignore errors (no content script available)
                  });
                return; // no tab active --> e.g. about:addons
            }

            if (excludeFileExtensions.some(val => activeTab.url.indexOf(val) !== -1)) {
                // don't enhance xml files = don't affect xml viewer
                // array so it's easily possible to add more excludes
                return;
            }

            // show enhancement at addon bar icon
            updateAddonbarIcon(true);

            console.log('injected tabs', this.injectedTabs, activeTab.id, this.injectedTabs.indexOf(activeTab.id));
            if (this.injectedTabs.indexOf(activeTab.id) > -1) {
                // already added scripts & css
                return;
            }

            this.injectCSS();
            this.injectScripts(activeTab);
        };

        // execute query
        browser.tabs.query({
            active: true,
            lastFocusedWindow: true,
            url: whitelist}).then((tabs) => queryCallback(tabs)).
              catch(ExtensionEventHandlers.onError);
    }
}

// start extension's background script
const extension = new LocalFileSystemExtension();
