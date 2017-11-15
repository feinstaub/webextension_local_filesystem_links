// Constants.js
var pkg = require('../../../package.json'),
    osFileManagerName = require('../utils/os-util').getFileManagerDisplayName;

exports.APP = {
    name: pkg.name,
    title: pkg.title,
    version: pkg.version
};

exports.MESSAGES = {
    FILEMANAGER: osFileManagerName(),
    USERMESSAGES: {
        tooltips: {
            openFolder: chrome.i18n.getMessage('TOOLTIP_OPEN_FOLDER'), //'Open folder', // _('TOOLTIP_OPEN_FOLDER'),
            linkText: chrome.i18n.getMessage('TOOLTIP_OPEN_LINK') //'Open link' // _('TOOLTIP_OPEN_LINK')
        }
    }
};
