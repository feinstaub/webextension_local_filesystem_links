// Constants.js
var pkg = require('../../package.json'),
    osFileManagerName = require('../utils/os-util').getFileManagerDisplayName,
    _ = require('sdk/l10n').get;

exports.APP = {
    name: pkg.name,
    title: pkg.title,
    version: pkg.version
};

exports.MESSAGES = {
    FILEMANAGER: osFileManagerName(),
    USERMESSAGES: {
        tooltips: {
            openFolder: _('TOOLTIP_OPEN_FOLDER'),
            linkText: _('TOOLTIP_OPEN_LINK'),
            openInBrowser: _('TOOLTIP_OPEN_IN_BROWSER')
        }
    }
};
