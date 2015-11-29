// Constants.js
var pkg = require( "../../package.json" );

exports.APP = {
    name: pkg.name,
    title: pkg.title,
    version: pkg.version
};

exports.MESSAGES = {
    ERROR: {
        BAD_LINK: "Couldn't open file: "
    }
};
