/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const widget = require("widget");
const data = require('self').data;
const panel = require("panel");

exports.createExtensionWidget = function() {
  console.debug("createExtensionWidget");
  
  let icon1 = data.url("addon_icon_16x16.png"),
  icon1hover = data.url("addon_icon_16x16_hover.png"),
  mainPanel,
  tooltipPanel
  
  mainPanel = panel.Panel({
    contentURL: data.url("main-wid/main-panel.htm"),
    onHide: function() {
      this.show();
    }
  });
  
  tooltipPanel = panel.Panel({
    contentURL: data.url("main-wid/tooltip-panel.htm"),
    contentScriptFile: [ data.url("js/jquery-1.6.2.min.js"),
    data.url("js/jquery-ui-1.8.16.custom.min.js"),
    data.url("main-wid/tooltip-panel.js")],
    // contentScript: "console.log('muh')",
    contentScriptWhen : "ready"
  });
  tooltipPanel.port.on("show_options", function() {
    console.debug("main: show_options");
    mainPanel.show();
  });
  
  var a = widget.Widget({
    id: "lfl-w",
    label: "Local Filesystem Links",
    // content: "Hello!",
    // width: 50
    contentURL: icon1,
    
    panel: tooltipPanel,
    
    onMouseover: function() {
      this.contentURL = icon1hover;
    },
    
    onMouseout: function() {
      this.contentURL = icon1;
    },
    
  // onClick: function() { mainPanel.show(); }
  });
}
