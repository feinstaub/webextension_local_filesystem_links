/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const widget = require("widget");
const data = require('self').data;
const panel = require("panel");
const tabs = require('tabs');

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
    tooltipPanel.hide();
    openOptionsTab();
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
    }
    
  // onClick: function() { mainPanel.show(); }
  });
  
  // if the user opens the options page via bookmark we would like
  // to have jQuery active
  tabs.on("ready", function(tab) {
    if (tab.url === data.url("main-wid/main-panel.htm")) {
      attachScriptsToOptionsTab(tab);
    }
  });
}

function openOptionsTab() {
  let url = data.url("main-wid/main-panel.htm");
   
  for each (var tab in tabs) {
    if (tab.url === url) {
      tab.activate();
      return;
    }
  }
 
  tabs.open(url);
//    tabs.open({
//      url: url
//      
//      // not needed because we do this generally using tabs.on("ready"...)
//      ,
//      onReady: function() {
//        // workers must be attached onReady
//        // SEE: https://addons.mozilla.org/en-US/developers/docs/sdk/1.3/dev-guide/addon-development/content-scripts/using-port.html
//  
//        attachScriptsToOptionsTab(this);
//      }
//    });
// }
}

function attachScriptsToOptionsTab(tab) {
  var worker = tab.attach({
    contentScriptFile: [ data.url("js/jquery-1.6.2.min.js"),
    data.url("js/jquery-ui-1.8.16.custom.min.js"),
    data.url("main-wid/main-panel.js") ]
  // contentScript: "documentReady();"
  });
        
  // worker.postMessage("hallo");
  worker.port.emit("load");
  
  worker.port.on("button_ok", function() {
    console.debug("oo");
  });
  
  worker.port.on("button_cancel", function() { 
    console.debug("cc");
    tab.close();
  });
}
