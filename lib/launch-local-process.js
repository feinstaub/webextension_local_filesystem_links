// LaunchExplorer.js
var {Cc, Ci, Cu} = require('chrome'), // Use Components.classes & Components.interfaces
    linkUtil = require('./utils/link-util'),
    notification = require('./notification'),
    isWindowsOs = require('./utils/os-util').isWindowsOs,
    CONST = require('./common/constants'),
    simplePrefs = require('sdk/simple-prefs'),
    FileUtils = Cu.import('resource://gre/modules/FileUtils.jsm').FileUtils,
    _ = require('sdk/l10n').get,
    openSmbLink = false; // true if we have a smb link to open

//
// Returns the value of the given environment variable
// throws if variable does not exist
// SEE https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIEnvironment
//

function getEnvironmentVariable(variableName) {
    var env = Cc['@mozilla.org/process/environment;1'].
        getService(Ci.nsIEnvironment);

    if (!env.exists(variableName)) {
        throw 'getEnvironmentVariable: variable does not exist: ' +
        variableName;
    } else {
        return env.get(variableName);
    }
}

exports.getEnvironmentVariable = getEnvironmentVariable;

// url2path from here
// sources.disruptive-innovations.com/bluegriffon/trunk/modules/urlHelper.jsm
// info: nsifile = new FileUtils.File( fileName ) is a wrapper for nsILocalFile
// and also runs initWithPath
function url2path(url) {
    var path = url;

    if (/^file/i.test(url)) {
        try {
            var uri = Cc['@mozilla.org/network/standard-url;1'].
                createInstance(Ci.nsIURL);
            var file = Cc['@mozilla.org/file/local;1'].
                createInstance(Ci.nsILocalFile);
            // console.log('before replace', url);
            // add feature to allow 4 slashes too for UNC network addresses
            var regex = /\bfile:(\/\/){2}\b/i;

            //4 slashes? add another one to have 5 slashes
            url = url.replace(regex, 'file://///');
            // console.log('replaced', url);
            uri.spec = url;

            try {
                if (!isWindowsOs) { // decent OS
                    var unixPath = uri.path;

                    // replace backslashes (just if there are any)
                    // windows can open file:\\ but Linux can't
                    // console.log('test unixPath', /\%5C/.test(unixPath),
                    //  unixPath);
                    if (/\%5C/.test(unixPath)) {
                        // contains backslashes --> replace with slashes
                        // @todo the following log is only visible to addon
                        //       developer
                        //       (also the log is only visible in unix systems,
                        //       check why)
                        //       --> It would be better to have it in browser
                        //           console
                        //           but this requires some work. (see PR #58)
                        console.log('Handling non-standard backslash ' +
                            'links now.');
                        // converted %5c = \ backslashes to slashes
                        unixPath = unixPath.replace(/\%5C/g, '/');
                        // remove 3 slashes added by FF
                        unixPath = unixPath.replace(/\/{3}/, '');
                        //console.log('fixed path', unixPath);
                    }

                    // hack to have ~ path working in Linux
                    // one or two slashes before ~ // stop at first / after ~
                    unixPath = unixPath.replace(/(\/){1,2}~\//, '~/');
                    // console.log('path for init', unixPath);
                    file.initWithPath(unixPath);
                } else {
                    // console.log('windows', uri.path, path);
                    file.initWithPath(uri.path.replace(/^\//, '').
                        replace(/\//g, '\\'));
                }
            } catch (e) {
                console.log(e);
            }
            path = decodeURI(file.path);
        } catch (e) {
            console.log(e);
        }
    }
    /*else if (/^(smb|afp)/i.test(path)) {
    console.log('smb/afp link');
    // how do we need to handle these links so nsiFile can open them?!

    path = uri.spec;
    openSmbLink = true;
}*/

    return path;
}

exports.url2path = url2path;

function getNsIFileFromPath(path) {
    var localPath = linkUtil.stripQuotes(path),
        nsiFile;

    // we need this because the nsILocalFile seems not happy with file:///
    // on Windows (but Windows explorer would be)

    localPath = url2path(localPath);
    // console.log('localpath', localPath);

    // the following code works except smb/afp

    try {
        // is doing the same as the code before (nsILocalFile), just a wrapper.
        nsiFile = new FileUtils.File(localPath);
    } catch (e) {
        //console.log('file error', e);
        nsiFile = null;
    }

    return nsiFile;
}

exports.getNsIFileFromPath = getNsIFileFromPath;


function pathExists(localFile) {
    //let localFile = getNsIFileFromPath(localPath);
    return localFile && localFile.exists();
}

exports.pathExists = pathExists;

function start(path, reveal) {
    var fileRegex = /^(.*\/)([^\/]*)$/,
        allowAll = simplePrefs.prefs.enableExecutables;

    //console.log('test if backslash in path', /\\/.test(path), path);
    //if (/\\/.test(path)) {
    // test not working because FF converts \ to /
    // --> preference to enable backslash links not possible because we can't
    //     test for backslashes here

    // console.log('opening path', path);
    var nsLocalFile = getNsIFileFromPath(path);


    if (pathExists(nsLocalFile)) {
        // console.log('path exists', nsLocalFile);
        if (reveal) {
            nsLocalFile.reveal();
        } else {
            if (nsLocalFile.isExecutable() && !allowAll &&
                !nsLocalFile.isDirectory()) {
                //console.log('is isExecutable', nsLocalFile, path,
                //  nsLocalFile.path);
                notification.show(CONST.APP.name,
                    _('ERROR_EXECTUBALES_NOT_ENABLED'));
            } else {
                nsLocalFile.launch();
            }
        }
    } else {
        // file could be not found --> check if a reveal is requested
        if (reveal) {
            //console.log('Reveal', path);
            // already fixed before calling start!!
            //path = path.replace(/\\/g, '/'); // replace backslashes

            // we need to check if file has 2 slashes
            // because ff won't fix it
            //path = path.replace(/file:[\/]{2,3}/i, 'file:\/\/\/');

            // problem exec crashes if there is a backslash passed!!
            // (that's why we converted them before)

            // --> happens if selection reveal marked e.g. C:\temp\test.text

            // if reveal omit the file so we're getting the folder
            // even with a non-existing file
            path = fileRegex.exec(path)[1]; // strip file

            if (! /file:/i.test(path)) {
                // selected a link with-out file:// for reveal
                path = 'file:///' + path; // add file protocol
            }
            nsLocalFile = getNsIFileFromPath(path);

            // test again
            if (pathExists(nsLocalFile)) {
                nsLocalFile.reveal();
            } else {
                notification.show(CONST.APP.name,
                    _('ERROR_BAD_LINK', decodeURI(path)));
            }
        } else if (openSmbLink) { // add os-check later
            // check configuration and modify it if necessary.
            // better check the settings on pageMod attach
            notification.show(CONST.APP.name,
                _('INFO_CONFIG_CHANGE_SMB'));
        } else {
            try {
                // e.g. clicking on a link with %HOMEDRIVE%%HOMEPATH%
                // in Linux will throw malformed URI sequence
                notification.show(CONST.APP.name,
                    _('ERROR_BAD_LINK', decodeURI(path)));
            } catch (e) {
                notification.show(CONST.APP.name,
                    _('ERROR_BAD_LINK', ' - ' + e.message));
            }
        }
    }
}

exports.start = start;
