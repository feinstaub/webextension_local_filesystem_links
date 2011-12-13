/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const widget = require("widget");
const data = require('self').data;

exports.createExtensionWidget = function() {
  console.debug("createExtensionWidget");
  
  widget.Widget({
    id: "lfl-w",
    label: "Local Filesystem Links",
    // content: "Hello!",
    // width: 50
    contentURL: data.url("addon_icon_16x16.png")
  });
}