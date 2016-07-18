/*
 * License: www.mozilla.org/MPL/
 * Created by https://github.com/feinstaub/firefox_addon_local_filesystem_links
 */
'use strict';

var {Cc, Ci} = require('chrome');

var getOsStringTag = function() {

    // https://developer.mozilla.org/en/nsIXULRuntime
    var xulRuntime = Cc['@mozilla.org/xre/app-info;1'].
        getService(Ci.nsIXULRuntime);

    // see https://developer.mozilla.org/en/OS_TARGET
    return xulRuntime.OS;
};

var retrieveIsWindowsOs = function() {
    var osStringTag = getOsStringTag();

    return osStringTag === 'WINNT';
};
const constIsWindowsOs = retrieveIsWindowsOs();

var isWindowsOs = function() {
    // console.log('isWindowsOs', constIsWindowsOs);
    return constIsWindowsOs;
};

exports.isWindowsOs = isWindowsOs;

exports.getFileManagerDisplayName = function() {
    if (isWindowsOs()) {
        return 'Windows Explorer';
    } else {
        return 'default file manager';
    }
};
