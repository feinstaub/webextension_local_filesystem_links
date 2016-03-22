"use strict";

var { MatchPattern } = require("sdk/util/match-pattern");

/**
 * Check if URI is in whitelist
 * @param includePattern object {0: "*", ...}
 * @param uri to test
 * @return testResult true or false
 */
exports.isUriIncluded = function(includePattern, uri) {
    // const specialUris = [
    //     'about:newtab',
    //     'about:addons'
    // ];

    // removed specialUris because it is OK to keep the red icon
    // if ( specialUris.indexOf(uri) !== -1 ) {
    //     // show active icon for these tabs
    //     test = true;
    // }
    // else {
    return Object.keys(includePattern).some(function (key) {
        // console.log(includePattern[key]);
        // @todo includePattern[key] can throw an error if user passes a whitespace
        //       in front of *.url and it fails silently at the moment.
        var pattern = new MatchPattern(includePattern[key]);

        // use val
        // console.log('pattern = ' + includePattern[key]);
        return ( pattern.test(uri) );
    });
    //}
}
