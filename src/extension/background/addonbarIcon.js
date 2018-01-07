/** Updates the addonbar icon (active/inactive)
* @param {boolean} status True, extension active for current tab else inactive
* @returns {undefined}
*/
export function updateAddonbarIcon(status) {
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
