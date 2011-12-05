/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

//
// helper methods
//

function strTrim(str) {
  let trimmed = str.replace(/^\s+|\s+$/g, '');
  return trimmed;
}
exports.strTrim = strTrim;

function strStartsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}
exports.strStartsWith = strStartsWith;

function strEndsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
exports.strEndsWith = strEndsWith;

function strContains(str, substr) {
  return str.indexOf(substr) != -1;
}
exports.strContainsWith = strContains;
