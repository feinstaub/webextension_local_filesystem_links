// LaunchExplorer.js
var { Cc, Ci, Cu } = require( "chrome" ), // Use Components.classes & Components.interfaces
    linkUtil = require( "./utils/link-util" ),
    notification = require( "./notification" ),
    CONST = require( "./common/constants" ),
    prefs = require( "./common/preferences"),
    {isWindowsOs} = require( "./utils/os-util"),

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

            // replace backslashes (just if there are any)
            // windows can open file:\\ but Linux can't
            // console.log('test unixPath', /\%5C/.test(unixPath), unixPath);
            if ( /\%5C/.test(unixPath) ) {
              // contains backslashes --> replace with slashes
              // @todo the following log is only visible to addon developer
              //       (also the log is only visible in unix systems, check why)
              //       --> It would be better to have it in browser console
              //           but this requires some work. (see PR #58)
              console.log('Handling non-standard backslash links now.');
              unixPath = unixPath.replace(/\%5C/g, "/"); // converted %5c = \ backslashes to slashes
              unixPath = unixPath.replace(/\/{3}/, "");  // remove 3 slashes added by FF
              //console.log('fixed path', unixPath);
            }

            // hack to have ~ path working in Linux
            unixPath = unixPath.replace(/(\/){1,2}~\//, "~/"); // one or two slashes before ~ // stop at first / after ~

            file.initWithPath(unixPath);
          } catch (e) {}
          try { // Windows sucks
            //   console.log('windows', uri.path, path);
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
    // console.log('localpath', localPath);

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
    var fileRegex = /^(.*\/)([^\/]*)$/,
        match = fileRegex.exec(path),
        isExecutable = isWindowsOs ?
            /(\.exe)$/i.test(path) : /^(.*\/bin\/.*)$/i.test(path),
        fileDir = match[1],
        fileName = match[2],
        whiteListExe = prefs.options.whitelistExecutables.split(/\s+/),
        allowAll = ( whiteListExe.indexOf('*') !== -1 );

    console.log('check if exe', isExecutable, fileName, fileDir, whiteListExe);

    if ( !reveal && isExecutable ) {
        // no reveal = direct file link to an executable file
        // check exe whitelist
        if (whiteListExe.indexOf(fileName) === -1 && !allowAll ) {
            notification.show( CONST.APP.name,
                "You're trying to open a not whitelisted executable file. Please check addon settings and try again." );
            return false;
        } //else we can execute the rest of the start code
    }
    // console.log('remove file if reveal', path, reveal? (/^(.*\/)([^/]*)$/).exec(path)[1] : 'no reveal');


    //console.log('test if backslash in path', /\\/.test(path), path);
    //if ( /\\/.test(path) ) {
    // test not working because FF converts \ to /
    // --> preference to enable backslash links not possible because we can't
    //     test for backslashes here

    if ( reveal ) {

        //console.log('Reveal', path);
        path = path.replace(/\\/g, '/'); // replace backslashes

        // we need to check if file has 2 slashes because ff won't fix it
        path = path.replace(/file:[\/]{2,3}/i, 'file:\/\/\/');

        // problem exec crashes if there is a backslash passed!!
        // (that's why we converted them before)

        // --> happens if selection reveal marked e.g. C:\temp\test.text

        // if reveal omit the file so we're getting the folder even with a
        // non-existing file
        path = fileRegex.exec(path)[1]; // strip file

        if ( ! /file:/i.test(path) ) {
            // selected a link with-out file:// for reveal
            path = 'file:///' + path; // add file protocol
        }
    }

    var nsLocalFile = getNsIFileFromPath( path );


    if ( pathExists( nsLocalFile ) ) {
        // console.log('path exists', nsLocalFile);
        if ( reveal ) {
            nsLocalFile.reveal();
        } else {
            nsLocalFile.launch();
        }
    } else {
        // console.log("path doesn't exist", path, reveal);
        if ( openSmbLink ) { // add os-check later
            // check configuration and modify it if necessary.
            // better check the settings on pageMod attach
            notification.show( CONST.APP.name, 'Configuration changed! SMB links now enabled');
        } else {
            notification.show( CONST.APP.name, CONST.MESSAGES.ERROR.BAD_LINK + decodeURI(path) );
        }
    }
}

exports.start = start;
