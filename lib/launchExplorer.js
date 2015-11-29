// LaunchExplorer.js
var { Cc, Ci } = require( "chrome" ), // Use Components.classes & Components.interfaces
    linkUtil = require( "./utils/link-util" ),
    notification = require( "./notification" ),
    CONST = require( "./common/constants" );

exports.start = function( path, reveal ) {

    var localPath = linkUtil.stripQuotes( path );

    // we need this because the nsILocalFile seems not happy with file:/// on Windows
    // (but Windows explorer would be)
    localPath = linkUtil.osSpecificLinkStringFix( localPath );

    var nsLocalFile = Cc[ "@mozilla.org/file/local;1" ].createInstance( Ci.nsILocalFile );

    try {
        nsLocalFile.initWithPath( localPath );
        nsLocalFile.QueryInterface( Ci.nsIFile );
        if ( reveal ) {
            nsLocalFile.reveal();
        } else {
            nsLocalFile.launch();
        }
    }
    catch ( e ) {
        console.log( e );
        notification.show( CONST.APP.name, CONST.MESSAGES.ERROR.BAD_LINK + path );
    }

    // If ( nsLocalFile.isFile() || nsLocalFile.isDirectory() ) {
    //     nsLocalFile.launch();
    // }

};
