/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

//
// helper methods
//

var strTrim = function(str) {
    let trimmed = str.replace(/^\s+|\s+$/g, '');
    return trimmed;
};
exports.strTrim = strTrim;

var strStartsWith = function(str, prefix) {
    return str.substring(0, prefix.length) === prefix;
};
exports.strStartsWith = strStartsWith;

var strEndsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};
exports.strEndsWith = strEndsWith;

var strContains = function(str, substr) {
    return str.indexOf(substr) != -1;
};
exports.strContainsWith = strContains;
