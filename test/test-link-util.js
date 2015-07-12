/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const linkUtil = require("../lib/link-util");

exports.test_stripQuotes = function(test) {
  test.assertEqual(linkUtil.stripQuotes("aaa"), "aaa");
  test.assertEqual(linkUtil.stripQuotes("\"aaa\""), "aaa");
  // test.assertEqual(localProcess.stripQuotes("\"aaa"), "aaa"); // throws error
}

exports.test_fixFileLinkStringForWindowsOs = function(test) {
  test.assertEqual(linkUtil.fixFileLinkStringForWindowsOs("file:///W:/"), "W:\\");
  test.assertEqual(linkUtil.fixFileLinkStringForWindowsOs("file:///W:/a/bb/ccc"), "W:\\a\\bb\\ccc");
}

exports.test_looksLikeLocalFileLink = function(test) {
  test.assertEqual(linkUtil.looksLikeLocalFileLink("file:///W:/"), true);
  test.assertEqual(linkUtil.looksLikeLocalFileLink("file:///W:/asdfasdf asdfasdf"), true);
  test.assertEqual(linkUtil.looksLikeLocalFileLink("http://www.google.com"), false);
  // test.assertEqual(linkUtil.looksLikeLocalFileLink("file:///AB:/"), false); // TODO
  // test.assertEqual(linkUtil.looksLikeLocalFileLink("file:///abc/def"), false); // TODO
}
