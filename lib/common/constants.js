// Constants.js
var pkg = require( "../../package.json" ),
    osFileManagerName = require( "../utils/os-util" ).getFileManagerDisplayName;

exports.APP = {
    name: pkg.name,
    title: pkg.title,
    version: pkg.version
};

exports.MESSAGES = {
    ERROR: {
        BAD_LINK: "Couldn't open file: "
    },
    FILEMANAGER: osFileManagerName(),
    USERMESSAGES: {
        tooltips: {
            openFolder: 'Open folder',
            linkText: 'Open link'
        }
    }
};
