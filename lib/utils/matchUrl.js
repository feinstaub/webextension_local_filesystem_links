"use strict";

var { MatchPattern } = require("sdk/util/match-pattern");

/**
 * Check if URI is in whitelist
 * @param includePatterns object {0: "*", ...}
 * @param uri to test
 * @return testResult true or false
 */
exports.isUriIncluded = function(includePatterns, uri) {
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
    return Object.keys(includePatterns).some(function (key) {
        // console.log(includePatterns[key]);
        // @todo includePatterns[key] can throw an error if user passes a whitespace
        //       in front of *.url and it fails silently at the moment.
        var pattern = new MatchPattern(includePatterns[key]);

        // use val
        // console.log('pattern = ' + includePatterns[key]);
        return ( pattern.test(uri) );
    });
    //}
}
