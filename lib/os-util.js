/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

var {Cc, Ci} = require("chrome");
const constIsWindowsOs = retrieveIsWindowsOs();

function getOsStringTag() {
    // https://developer.mozilla.org/en/nsIXULRuntime
    var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);

    // see https://developer.mozilla.org/en/OS_TARGET
    return xulRuntime.OS;
}

function retrieveIsWindowsOs() {
    var osStringTag = getOsStringTag();
    return osStringTag == "WINNT";
}

function isWindowsOs() {
    return constIsWindowsOs;
}
exports.isWindowsOs = isWindowsOs;

exports.getFileManagerDisplayName = function() {
    if (isWindowsOs()) {
        return "Windows Explorer";
    }
    else {
        return "System File Manager";
    }
}
