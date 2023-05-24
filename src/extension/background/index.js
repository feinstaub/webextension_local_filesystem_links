import * as CONSTANTS from '../constants';
import checkInstallation from './checkInstallation';
import { updateAddonbarIcon } from './addonbarIcon';
import { ExtensionEventHandlers } from './EventHandlers';

/** Main background script class of the extension */
class LocalFileSystemExtension {
    /** Initialize the extension
     */
    constructor() {
        this.settings = {};
        this.injectedTabs = {};
        this.eventHandlers = new ExtensionEventHandlers(this.settings);
        this.addListeners();

        browser.storage.local.get('injectedTabs').then(({ injectedTabs }) => {
            // console.log("loaded tabs from local storage", injectedTabs);
            this.injectedTabs = injectedTabs || {};
        });
    }

    /** Add eventlisteners of the extension
     * @returns {undefined}
     */
    addListeners() {
        // add message handling
        browser.runtime.onMessage.addListener(
            this.eventHandlers.onMessage.bind(this)
        );

        const checkPage = () => {
            updateAddonbarIcon(false); // always toggle to inactive
            this.checkUrls();
        };

        browser.windows.onCreated.addListener(checkPage); // initial load of firefox
        browser.tabs.onActivated.addListener(checkPage); // switched between tabs
        browser.windows.onFocusChanged.addListener(checkPage); // switched from other window

        browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
            //console.log('remove', tabId, removeInfo);
            this.removeTabFromInjectedTabs(tabId);
        });

        const updateHandler = (tabId, changeInfo, tab) => {
            if (tab.active) {
                if (changeInfo.status && changeInfo.status === 'loading') {
                    // console.log('loading', tabId, tab.active);
                    this.removeTabFromInjectedTabs(tabId); // url changed and loading a new page - remove tabId as we need to inject the content script
                }

                // console.log('change info: ', changeInfo);
                // console.log(this.injectedTabs);

                if (changeInfo.status && changeInfo.status === 'complete') {
                    // check if content script is not connected
                    browser.tabs
                        .sendMessage(tabId, { action: 'ping' })
                        .catch(e => {
                            // console.log(e);
                            // console.log('no content script');
                            this.removeTabFromInjectedTabs(tabId);
                        })
                        .finally(() => {
                            // check if we have to load the extension for the active tab
                            // -> always runs as last action
                            // console.log('check urls in complete');
                            this.checkUrls();
                        });
                }
            }
        };

        browser.tabs.onUpdated.addListener(updateHandler);

        const browserHistoryHandler = details => {
            if (details.transitionQualifiers.includes('forward_back')) {
                // console.log("using cached page");
                this.injectedTabs[details.tabId] = true; // Add tabId to keep track of cached injection.
                browser.storage.local.set({ injectedTabs: this.injectedTabs });
            }
        };

        browser.webNavigation.onCommitted.addListener(browserHistoryHandler);

        // check if first installation or update
        browser.runtime.onInstalled.addListener(checkInstallation);
    }
    /**
     * Remove tab from injectedTabs array (if exists)
     * @param {integer} windowId id of current window
     * @param {integer} tabId id of tab to remove
     */
    removeTabFromInjectedTabs(id) {
        if (this.injectedTabs[id]) {
            // console.log('remove id', id);
            delete this.injectedTabs[id];
            browser.storage.local.set({ injectedTabs: this.injectedTabs });
        }
    }
    /** Check the urls (if active tab is whitelisted)
     * @returns {undefined}
     */
    checkUrls() {
        // load settings from local storage
        browser.storage.local
            .get()
            .then(settings =>
                this.eventHandlers.onSettingsLoaded(
                    settings,
                    this.loadExtension.bind(this)
                )
            );
    }

    /** Insert CSS into page
     * @returns {undefined}
     */
    injectCSS() {
        browser.tabs.insertCSS(null, {
            allFrames: true,
            file: 'css/self-hosted-materialize.css'
        });
        browser.tabs.insertCSS(null, {
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

        execute(null, {
            allFrames: true,
            file: 'js/jquery-3.3.1.min.js'
        })
            .then(() =>
                execute(null, {
                    allFrames: true,
                    file: './content.js',
                    runAt: 'document_end'
                })
            )
            .then(() => {
                // jquery & content script loaded --> now we can send init data
                const settings = this.settings;
                // console.log("sending init to content script!!");
                browser.tabs.sendMessage(activeTab.id, {
                    action: 'init',
                    data: {
                        options: {
                            enableLinkIcons: settings.enableLinkIcons,
                            revealOpenOption: settings.revealOpenOption
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

        const queryCallback = tabs => {
            if (!tabs) {
                return; // no match
            }

            const activeTab = tabs.filter(tab => tab.active)[0];

            if (!activeTab) {
                // console.log('no active tab');
                // needed if tab is newly removed from the whitelist --> stop active content script
                // --> removed below as it was causing an issue with multiple events. Removing means a whitelist change requires a page reload. Acceptable behaviour.
                // Note: Also an unfocused window will also trigger this case
                return; // no tab active --> e.g. about:addons
            }

            if (
                excludeFileExtensions.some(
                    val => activeTab.url.indexOf(val) !== -1
                )
            ) {
                // don't enhance xml files = don't affect xml viewer
                // array so it's easily possible to add more excludes
                return;
            }

            // show enhancement at addon bar icon
            updateAddonbarIcon(true);

            // console.log("check injected tabs", this.injectedTabs, activeTab.id)
            if (!this.injectedTabs[activeTab.id]) {
                // add scripts & css to the page (only once per tab)
                // console.log('inject', activeTab.id);
                this.injectCSS();
                this.injectScripts(activeTab);
                this.injectedTabs[activeTab.id] = true; // add id to keep track of injection.
                browser.storage.local.set({ injectedTabs: this.injectedTabs });
            }
        };

        // execute query
        browser.tabs
            .query({
                active: true,
                lastFocusedWindow: true,
                url: whitelist
            })
            .then(tabs => queryCallback(tabs))
            .catch(ExtensionEventHandlers.onError);
    }
}

// start extension's background script
const extension = new LocalFileSystemExtension();
