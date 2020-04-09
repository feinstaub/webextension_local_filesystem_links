// Constants.js
var pkg = require('../../package.json'),
    osFileManagerName = require('./utils/os-util').getFileManagerDisplayName;

export const APP = {
    name: pkg.name,
    title: pkg.title,
    version: pkg.version
};

export const MESSAGES = {
    FILEMANAGER: osFileManagerName(),
    USERMESSAGES: {
        tooltips: {
            openFolder: browser.i18n.getMessage('TOOLTIP_OPEN_FOLDER'), //'Open folder', // _('TOOLTIP_OPEN_FOLDER'),
            linkText: browser.i18n.getMessage('TOOLTIP_OPEN_LINK') //'Open link' // _('TOOLTIP_OPEN_LINK')
        }
    }
};

export const defaultSettings = {
    whitelist: '*',
    enableExecutables: false,
    revealOpenOption: 'O', // default = open link
    enableLinkIcons: true,
    retriesOnFailure: 1 // default = one retry, error indication delayed by one retry is OK
};

export const DELAY_BETWEEN_RETRIES = 100; // ms delay between retries
