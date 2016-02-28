/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const stringUtil = require( "../lib/utils/string-util" );

exports.test_strEndsWith = function( test ) {
  test.assertEqual( stringUtil.strEndsWith( "W:\\", "\\" ), true );
  let s = "W:\\";
  test.assertEqual( s.substr( 0, s.length - 1 ), "W:" );
};
