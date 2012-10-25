/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const widget = require("widget");
const data = require('self').data;
const panel = require("panel");
const tabs = require('tabs');

var onSettingsApplyCallback;

var settingsRef;

const js_jquery_path = "js/jquery-1.7.2.min.js";
const js_jqueryui_path = "js/jquery-ui-1.8.16.custom.min.js";

exports.createExtensionWidget = function(options) {
  ////console.debug("createExtensionWidget");
  
  let icon1 = data.url("addon_icon_16x16.png"),
  icon1hover = data.url("addon_icon_16x16_hover.png"),
  mainPanel,
  tooltipPanel
  
  mainPanel = panel.Panel({
    contentURL: data.url("main-wid/main-panel.xhtml"),
    onHide: function() {
      this.show();
    }
  });
  
  tooltipPanel = panel.Panel({
    height: 300,
    contentURL: data.url("main-wid/toolbar-panel.xhtml"),
    contentScriptFile: [ data.url(js_jquery_path),
    data.url(js_jqueryui_path),
    data.url("main-wid/toolbar-panel.js")],
    // contentScript: "console.log('muh')",
    contentScriptWhen : "ready",
    onShow: function() {
      tooltipPanel.postMessage({
        type: "fresh_data", 
        data: settingsRef
      });
    }
  });

  tooltipPanel.port.on("show_options", function() {
    //// console.debug("main: show_options");
    tooltipPanel.hide();
    openOptionsTab();
  });

  tooltipPanel.port.on("action_rescan_page", function() {
      //// console.debug("main: show_options");
      tooltipPanel.hide();
      actionRescanPage();
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
    if (tab.url === data.url("main-wid/main-panel.xhtml")) {
      attachScriptsToOptionsTab(tab);
    }
  });
  
  // set options and other callbacks
  settingsRef = options.settings;
  onSettingsApplyCallback = options.onSettingsApplyCallback;
}

function openOptionsTab() {
  let url = data.url("main-wid/main-panel.xhtml");
   
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

function actionRescanPage() {
  alert("a"); // func not defined
}

function attachScriptsToOptionsTab(tab) {
  var worker = tab.attach({
    contentScriptFile: [ data.url(js_jquery_path),
    data.url(js_jqueryui_path),
    data.url("main-wid/main-panel.js") ]
  // contentScript: "documentReady();"
  });
        
  // worker.postMessage("hallo");
  worker.port.emit("load");
  
  worker.port.on("request_data", function() {
    worker.port.emit("fresh_data", settingsRef);
  });
  
  worker.port.on("button_ok", function(data) {
    //// console.debug("oo");
    
    // we directly modify the settings
    settingsRef.enableScanning = data.enableScanning;
    
    //// console.debug(JSON.stringify(settingsRef));
    
    onSettingsApplyCallback();
    
    closeOrBlankTab(tab);
  });
  
  worker.port.on("button_cancel", function() { 
    //// console.debug("cc");
    
    closeOrBlankTab(tab);
  });
}

function closeOrBlankTab(tab) {
  if (tabs.length > 1) {
    // only close if there are enough tabs (otherwise firefox closes)
    tab.close();
  }
  else {
    tab.url = "about:blank";
  }  
}
