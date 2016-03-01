// LaunchExplorer.js
var { Cc, Ci, Cu } = require( "chrome" ), // Use Components.classes & Components.interfaces
    linkUtil = require( "./utils/link-util" ),
    notification = require( "./notification" ),
    CONST = require( "./common/constants" ),

    FileUtils = Cu.import("resource://gre/modules/FileUtils.jsm").FileUtils,
    openSmbLink = false; // true if we have a smb link to open

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

// url2path from here
// http://sources.disruptive-innovations.com/bluegriffon/trunk/modules/urlHelper.jsm
function url2path(url) {
    var path = url;

    if (/^file/i.test(url)) {
        try {
          var uri = Cc['@mozilla.org/network/standard-url;1']
                              .createInstance(Ci.nsIURL);
          var file = Cc['@mozilla.org/file/local;1']
                               .createInstance(Ci.nsILocalFile);

          // console.log('before replace', url);
          // add feature to allow 4 slashes too for UNC network addresses
          var regex = /\bfile:(\/\/){2}\b/i;
          url = url.replace(regex,
           'file://///'); //4 slashes? add another one to have 5 slashes
          // console.log('replaced', url);
          uri.spec = url;

          try { // decent OS
            var unixPath = uri.path;

            // hack to have ~ path working in Linux
            unixPath = unixPath.replace(/(\/){1,2}~(\/)/, "~/"); // one or two slashes before ~ // stop at first / after ~
            
            file.initWithPath(unixPath);
          } catch (e) {}
          try { // Windows sucks
            file.initWithPath(uri.path.replace(/^\//,"").replace(/\//g,"\\"));
          } catch (e) {}
          path = decodeURI(file.path);
        } catch(e) {
        }
    }
    /*else if ( /^(smb|afp)/i.test(path) ) {
        console.log('smb/afp link');
        // how do we need to handle these links so nsiFile can open them?!

        path = uri.spec;
        openSmbLink = true;
    }*/

    return path;
}

exports.url2path = url2path;

function getNsIFileFromPath ( path ) {
    var localPath = linkUtil.stripQuotes( path ),
        nsLocalFile, nsiFile;

    // we need this because the nsILocalFile seems not happy with file:/// on Windows
    // (but Windows explorer would be)

    localPath = url2path(localPath); //linkUtil.osSpecificLinkStringFix( localPath );
    //console.log('localpath', localPath);

    // the following code works except smb/afp

    try {
        // is doing the same as the code before (nsILocalFile), just a wrapper.
        nsiFile = new FileUtils.File( localPath );
    }
    catch(e) {
        console.log('file error', e);
        nsiFile = null;
    }

    return nsiFile//nsLocalFile;
};

exports.getNsIFileFromPath = getNsIFileFromPath;


function pathExists( localFile ) {
    //let localFile = getNsIFileFromPath( localPath );

    return localFile && localFile.exists();
}

exports.pathExists = pathExists;

function start( path, reveal ) {

    var nsLocalFile = getNsIFileFromPath( path );

    if ( pathExists( nsLocalFile ) ) {
        if ( reveal ) {
            nsLocalFile.reveal();
        } else {
                nsLocalFile.launch();
        }
    } else {
        if ( openSmbLink ) { // add os-check later
            // check configuration and modify it if necessary.
            // better check the settings on pageMod attach
            notification.show( CONST.APP.name, 'Configuration changed! SMB links now enabled');
        } else {
            notification.show( CONST.APP.name, CONST.MESSAGES.ERROR.BAD_LINK + path );
        }
    }
}

exports.start = start;
