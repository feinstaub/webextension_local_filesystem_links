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

        const checkPage = () => {
            updateAddonbarIcon(false); // always toggle to inactive
            this.checkUrls();
        }

        browser.windows.onCreated.addListener(checkPage); // initial load of firefox
        browser.tabs.onActivated.addListener(checkPage); // switched between tabs
        browser.windows.onFocusChanged.addListener(checkPage); // switched from other window

        browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
            //console.log('remove', tabId, removeInfo);
            this.removeTabFromInjectedTabs(removeInfo.windowId, tabId);
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if(changeInfo.status && changeInfo.status === 'loading' && tab.active) {
                // console.log('loading', tabId, tab.active);
                this.removeTabFromInjectedTabs(tab.windowId, tab.id);
            }

            if (changeInfo.status && changeInfo.status === 'complete' &&
              tab.active) {
                // console.log('complete');
                this.checkUrls();
            }
        });

        // check if first installation or update
        browser.runtime.onInstalled.addListener(checkInstallation);
    }
    /**
     * Remove tab from injectedTabs array (if exists)
     * @param {integer} windowId id of current window
     * @param {integer} tabId id of tab to remove
     */
    removeTabFromInjectedTabs(windowId, id) {
        if (this.injectedTabs.indexOf(`${windowId}-${id}`) !== -1) {
            this.injectedTabs.pop(`${windowId}-${id}`);
        }
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
        
        execute(null, {allFrames: true, file: 'js/jquery-3.3.1.min.js'})
            .then(() => execute(null, {allFrames: true, file: 'js/jquery-observe.js'}))
            .then(() => execute(null, {allFrames: true, file: './content.js'}))
            .then(() => {
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
                // console.log('no active tab');
                // needed if tab is newly removed from the whitelist --> stop active content script
                // unloadContentScript();
                browser.tabs.query({active: true,
                    windowId: browser.windows.WINDOW_ID_CURRENT}).
                  then(tabs => browser.tabs.get(tabs[0].id)).
                  then(tab => {
                      // console.log('no active tab - destroy', tab);
                      browser.tabs.sendMessage(tab.id, {
                          action: 'destroy'
                      }).catch((err) => {
                          // console.log(err) // e.g. receiving end does not exist
                      }); // ignore errors (no content script available)

                      // remove tab from injected tabs array
                      this.removeTabFromInjectedTabs(tab.windowId, tab.id);
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

            // console.log('injected tabs', this.injectedTabs, activeTab.id, this.injectedTabs.indexOf(`${activeTab.windowId}-${activeTab.id}`) === -1);
            if (this.injectedTabs.indexOf(`${activeTab.windowId}-${activeTab.id}`) === -1) {
                // add scripts & css
                // console.log('inject', `${activeTab.windowId}-${activeTab.id}`);
                this.injectCSS();
                this.injectScripts(activeTab);
                
                this.injectedTabs.push(`${activeTab.windowId}-${activeTab.id}`); // add id to keep track of js adding.
            }
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
