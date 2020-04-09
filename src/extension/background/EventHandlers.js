import * as CONSTANTS from '../constants';
import { showInstallationTab } from './checkInstallation';
import notify from './notify';
import { prepareWhitelist } from './helpers/whitelist';

const { defaultSettings, DELAY_BETWEEN_RETRIES } = CONSTANTS;

/** Event handler methods of the extension */
export class ExtensionEventHandlers {
    /** Initialize EventHandler
     * @param {object} settings reference to app settings.
     */
    constructor(settings) {
        this.settings = settings;
        this.retriesOnFailure = 0;
    }

    /** Global Error handler
     *  @param {object} err error object
     *  @returns {undefined}
     */
    static onError(err) {
        // console.log('error handler:', err.name, err.message, err.stack,
        // err.lineNumber); // todo - check that really the connection to the native app isn't open
        const nativeAppNotInstalled = err.message.includes('disconnected port')
            ? ' Please check that you have installed the native app. ' +
              'See installation guide in addon-bar ' +
              'menu.'
            : '';

        // console.log('error', err);
        notify(err.name, err.message + '.' + nativeAppNotInstalled);
    }

    /**
     * Send native message with retries
     * @param {object} request
     * @param {string} uri
     */
    static sendNativeMessage(request, uri, handler) {
        browser.runtime
            .sendNativeMessage(
                // direct sending --> opens port to native app
                'webextension_local_filesystem_links',
                {
                    url: uri,
                    reveal: request.reveal,
                    exeAllowed: handler.settings.enableExecutables
                }
            )
            .then(function(response) {
                // console.log('received response', response);
                if (response && response.error) {
                    if (
                        handler.retriesOnFailure >=
                        handler.settings.retriesOnFailure
                    ) {
                        const msg = browser.i18n.getMessage(
                            response.error,
                            window.decodeURI(response.url)
                        );

                        notify('Error', msg); // only NotFound error at the moment
                    } else {
                        setTimeout(() => {
                            ExtensionEventHandlers.sendNativeMessage(
                                request,
                                uri,
                                handler
                            );
                            handler.retriesOnFailure++;
                        }, DELAY_BETWEEN_RETRIES);
                    }
                }
            })
            .catch(err => {
                const nativeAppNotInstalled = err.message.includes(
                    'disconnected port'
                )
                    ? ' Please check that you have installed ' +
                      'the native app. ' +
                      'See installation guide in addon-bar ' +
                      'menu.'
                    : '';

                // console.log('error', err);
                notify(err.name, err.message + '.' + nativeAppNotInstalled);
            }); //ExtensionEventHandlers.onError(err));
    }

    /**
     * Handler for content script messages
     * @param {object} request information about the request (e.g. action)
     * @param {object} sender sender info
     * @param {callback} sendResponse sends response to content script.
     * @returns {undefined}
     */
    onMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'showInstallInfoTab':
                showInstallationTab();
                break;
            case 'open':
                var uri = request.url;
                console.log('opening', uri);

                if (request.directOpen) {
                    // setting commented at the moment --> re-add later
                    browser.tabs.create({
                        active: true,
                        url: window.decodeURI(uri) // illegal URL --> not priveleged to add file:// - fix later
                    });
                } else {
                    this.retriesOnFailure = 0; // reset failure count
                    ExtensionEventHandlers.sendNativeMessage(
                        request,
                        uri,
                        this
                    );
                }
                break;
            default:
        }
    }

    /** Handler for app settingss loaded
     * @param {object} settings reference to settings of extension
     * @param {function} callback do somehing with the loaded settings
     * @returns {undefined}
     */
    onSettingsLoaded(settings, callback) {
        const loadedSettings = Object.assign({}, defaultSettings, settings);
        const whitelist = loadedSettings.whitelist.trim()
            ? prepareWhitelist(loadedSettings.whitelist.trim())
            : [];
        // const whitelist = ['*']; //['http://127.0.0.1:3000/*', '*://*.localhost/*', '*://*.google.de/*', '*://*.trello.com/*'];

        callback(loadedSettings, whitelist);
    }
}
