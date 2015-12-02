// LaunchExplorer.js
var { Cc, Ci } = require( "chrome" ), // Use Components.classes & Components.interfaces
    linkUtil = require( "./utils/link-util" ),
    notification = require( "./notification" ),
    CONST = require( "./common/constants" );

//
// Returns the value of the given environment variable
// throws if variable does not exist
// SEE https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIEnvironment
//

function getEnvironmentVariable( variableName ) {
    var env = Cc[ "@mozilla.org/process/environment;1" ].getService( Ci.nsIEnvironment );
    if ( !env.exists( variableName ) ) {
        throw "getEnvironmentVariable: variable does not exist: " + variableName;
    } else {
        return env.get( variableName );
    }
};

exports.getEnvironmentVariable = getEnvironmentVariable;

function getNsIFileFromPath ( path ) {
    var localPath = linkUtil.stripQuotes( path ),
        nsLocalFile;

    // we need this because the nsILocalFile seems not happy with file:/// on Windows
    // (but Windows explorer would be)
    localPath = linkUtil.osSpecificLinkStringFix( localPath );

    nsLocalFile = Cc[ "@mozilla.org/file/local;1" ].createInstance( Ci.nsILocalFile );

    nsLocalFile.initWithPath( localPath );
    nsLocalFile.QueryInterface( Ci.nsIFile );

    return nsLocalFile;
};

exports.getNsIFileFromPath = getNsIFileFromPath;

function pathExists( localPath ) {
    let localFile = getNsIFileFromPath( localPath );

    return localFile.exists();
}

exports.pathExists = pathExists;

function start( path, reveal ) {

    var nsLocalFile = getNsIFileFromPath( path );

    if ( pathExists( path ) ) {
        if ( reveal ) {
            nsLocalFile.reveal();
        } else {
            nsLocalFile.launch();
        }
    } else {
        notification.show( CONST.APP.name, CONST.MESSAGES.ERROR.BAD_LINK + path );
    }
}

exports.start = start;
