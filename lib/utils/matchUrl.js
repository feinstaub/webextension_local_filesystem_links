"use strict";

var { MatchPattern } = require("sdk/util/match-pattern");

/**
 * Check if URI is in whitelist
 * @param include object {0: "*", ...}
 * @param uri to test
 * @return testResult true or false
 */
exports.isUriIncluded = function(include, uri) {
    // const specialUris = [
    //     'about:newtab',
    //     'about:addons'
    // ];
    var test = false;

    // removed specialUris because it is OK to keep the red icon
    // if ( specialUris.indexOf(uri) !== -1 ) {
    //     // show active icon for these tabs
    //     test = true;
    // }
    // else {
    Object.keys(include).forEach(function (key) {
        var pattern = new MatchPattern(include[key]);

        // use val
        // console.log('pattern = ' + include[key]);
        if ( pattern.test(uri) ) {
            test = true;
            // console.log('pattern matched ', include[key]);
            return test; // exit at first match and return true
        }
    });
    //}

    return test; // if we're here --> no pattern matched
    //return pattern.test(uri); // true if matched
}
