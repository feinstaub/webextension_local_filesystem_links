/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

//Import the APIs we need.
const contextMenu = require("context-menu");
const request = require("request");
const selection = require("selection");
const translate = require("translate");
const self = require("self");
const data = require("self").data;
const tabs = require("tabs");
const pageMod = require("page-mod");
const localProcess = require("launch-local-process");
const linkUtil = require("link-util");
const osUtil = require("os-util");
const widgetMain = require("widget-main");
const ss = require("simple-storage");
////const jQuery = require("jquery-1.6.4-module.js").jQuery; // by alien
const prefs = require("preferences-service");

var hyperlinkScanner = undefined; // PageMod
var hyperlinkScannerWorkers = [];

//require("evallib").hello();

const jqueryFilename = "js/jquery-1.7.2.min.js";

//TODO: split into settings and state
//TODO: if we change this, we have to update this: search for "jQuery.extend" in this file
// and https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/page-mod/match-pattern.html
//    (* and file://* is needed)
var settings = {
        // default values
        selfVersion: null, // will be set elsewhere
        enableScanning: true,
        scannerIncludePatternArray: [ "*", "file://*" ]
};

function onMessageFunc(obj) {
    let text = obj[0];
    let lang = obj[1];

    translate.translate(text, lang, onTranslationComplete);    
};

function onTranslationComplete(translated) {
    //// console.log("getAllProperties(selection)");
    //// console.log(getAllProperties(selection).join("\n"));

    selection.text = translated;

    // highlight it
    //old: selection.html = "<i>" + selection.html + "</i>";

    // TODO: As soon as the translating component is activated again
    // make sure that the .html is replaced with something better, see review:
    /*
  Mail on 30.12.2011 08:26, subject: Mozilla Add-ons: Local Filesystem Links 0.64 Preliminary Reviewed
1) You alter the markup of documents by textually modifying their
innerHTML. This causes the entire document to be re-parsed, which aside
from the inefficiency has critical drawbacks, including invalidating any
JavaScript reference to replaced DOM nodes, clearing any JavaScript
properties and event listeners on replaced DOM nodes, re-executing any
script tags in the changed markup, and causing said scripts to fail if
they rely on document.write. Please create and alter DOM nodes with DOM
methods such as createElement and replaceChild, and the textContent
rather than innerHTML property.
     */
    selection.html = "<span style=\"background-color:#aaffaa\">" + selection.html + "</span>";
}

//
// MAIN
//
exports.main = function(options, callbacks) {
    //// console.log(options.loadReason);
    ////console.log(JSON.stringify(self));
    ////console.log(self.version);

    //  // Create a new context menu item.
    //  var menuItem = contextMenu.Item({
    // 
    //    label: "Translate Selection (to English)",
    // 
    //    // Show this item when a selection exists.
    // 
    //    context: contextMenu.SelectionContext(),
    // 
    //    // When this item is clicked, post a message to the item with the
    //    // selected text and current URL.
    //    contentScript: 'self.on("click", function () {' +
    //    '  var text = window.getSelection().toString();' +
    //    '  self.postMessage([ text, "en"]);' +
    //    '});',
    // 
    //    // When we receive the message, call the Google Translate API with the
    //    // selected text and replace it with the translation.
    //    onMessage: onMessageFunc
    //  });
    //  
    //  var menuItem2 = contextMenu.Item({
    //    label: "Translate Selection (to German)",
    //    context: contextMenu.SelectionContext(),
    //    contentScript: 'self.on("click", function () {' +
    //    '  var text = window.getSelection().toString();' +
    //    '  self.postMessage([text, "de"]);' +
    //    '});',
    // 
    //    onMessage: onMessageFunc
    //  });

    widgetMain.createExtensionWidget({
        onSettingsApplyCallback: function() {
            applySettings();
            persistSettings();
        },
        settings: settings
    });

    const menuItem3 = contextMenu.Item({
        label: "Open with " + osUtil.getFileManagerDisplayName(),
        context: contextMenu.SelectionContext(),
        contentScriptFile: [ data.url("open-with-fileexplorer.js") ],
        onMessage: function(message) {
            let path = message;
            try {
                localProcess.revealPathInFileManager(path);
            }
            catch (err) {
                console.warn(err);
                // port.emit("myEvent");
                //menuItem3.port.emit("hallo");
                // console.log(getAllProperties(menuItem3));

                userAlertCouldNotOpenPath(path);
            }
        }
    });

    hyperlinkScanner = pageMod.PageMod({
        // see applySettings: the include setting will be overwritten there!
        include: ["dummy://*"],
        contentScriptWhen: "ready",
        contentScriptFile:
            [data.url(jqueryFilename),
             data.url("hyperlink-scanner.js")
             ],
             onAttach: function(worker) {
                 hyperlinkScannerWorkers.push(worker); // save to detach later
                 worker.postMessage({
                     event: "init",
                     // INIT_DATA_DEFINITION
                     data: {
                         styleFileUrl: data.url("style.css"),
                         folder1Url: data.url("folder-2.png"),
                         folder1HoverUrl: data.url("folder-go.png"),
                         fileManagerDisplayName: osUtil.getFileManagerDisplayName()
                     }
                 });

                 worker.postMessage({
                     event: "scan_hyperlinks"
                 }); // the argument is our own object

                 worker.postMessage({
                     event: "scan_textnodes"
                 });

                 // var obj = { href: hrefs[i].href, i: i };
                 worker.port.on("href_found", function(obj) {
                     if (linkUtil.looksLikeLocalFileLink(obj.href)) {
                         worker.postMessage({
                             event: "href_mod",
                             data: obj.i
                         });
                     }
                 }),

                 worker.port.on("href", function(href) {
                     let path = href
                     try {
                         localProcess.revealPathInFileManager(path);
                     }
                     catch (err) {
                         console.warn(err);
                         userAlertCouldNotOpenPath(path);
                     }
                 }),

                 worker.on("detach", function() {
                     detachWorker(this, hyperlinkScannerWorkers);
                 })
             }
    });

    //  const contentTextScanner = pageMod.PageMod({
    //    include: ['*'],
    //    contentScriptWhen: 'ready',
    //    contentScriptFile: [ data.url(jqueryFilename),
    //                         data.url('content-text-scanner.js')
    //                       ],
    //    onAttach: function(worker) {
    //      worker.postMessage('scan');
    //    }
    //  });  

    // at last load and apply settings
    loadSettings();
    applySettings();
};

function userAlertCouldNotOpenPath(path) {
    showMessageBox("Local Filesystem Links:\n\nSorry. The following path could not be found:\n\n" + path);
}

/**
 * Show message box in the currently open tab
 * @param {string} The text to be displayed
 */
function showMessageBox(text) {
    var worker = tabs.activeTab.attach({
        contentScript:
            // convert text to "safe string"
            'window.alert(unescape("' + escape(text) + '"))'
    });

    worker.destroy();  
}

//
// usage examples:
//   print(getAllProperties(obj));
//   getAllProperties(Math).filter(function(o) { print(o); });
//
function getAllProperties(obj) {
    var result = [];
    var names = Object.getOwnPropertyNames(obj);
    // print(names); // "firstName,lastName,5,test"
    for (var i in names) {
        // print(names[i]); // "firstName", ...
        let name = names[i];
        result.push(i + ":" + name + "[" + typeof obj[name] + "]");
    }

    return result;
};

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if (index != -1) {
        // index    Required. An integer that specifies at what position to add/remove elements
        // howmany  Required. The number of elements to be removed. If set to 0, no elements will be removed
        // This method changes the original array!
        // http://www.w3schools.com/jsref/jsref_splice.asp
        workerArray.splice(index, 1);
    }
}


//function getMethods(obj) {
//  var result = [];
//  for (var id in obj) {
//    try {
//      if (typeof(obj[id]) == "function") {
//        result.push(id + ": " + obj[id].toString());
//      }
//    } catch (err) {
//      result.push(id + ": inaccessible");
//    }
//  }
//  return result;
//}
//
//function getAllMethods(object) {
//return Object.getOwnPropertyNames(object).filter(function(property) {
//return typeof object[property] == 'function';
//});
//}

exports.onUnload = function (reason) {
    //// console.log(reason);
};

exports.rescanCurrentTab = function() {
    //// console.log("rescanCurrentTab");
    //// console.log(hyperlinkScannerWorkers);
    //// console.log(tabs.activeTab.url);
    
    // "for each" is correct, see https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/tabs.html
    for each (var worker in hyperlinkScannerWorkers) {
        //// console.log(worker);
        if (worker.url === tabs.activeTab.url) {
            worker.postMessage({ event: "rescan_page" });
            // do not return because maybe the user has more than one tab with the same URL
            // TODO: better find the really active tab!
        }
    }
}

//write settings to persistent storage
function persistSettings() {
    //// console.log("persistSettings")
    ss.storage.settings = settings;
}

//loads the settings from persistent storage
//If there is no storage yet, just keep the default settings
//otherwise overwrite the default settings

//WARN: call only once because we are giving a ref to toolbar-panel-main
function loadSettings() {
    //// console.log("storage: " + JSON.stringify(ss.storage.settings));
    //// console.log("defaults: " + JSON.stringify(settings));
    
    if (ss.storage.settings != undefined) {
        
        var loadedSelfVersion = ss.storage.settings.selfVersion;
        if (loadedSelfVersion !== self.version) {
            
            // TODO: write code here to upgrade if version has changed
            
            settings.selfVersion = self.version;
        }

        // http://api.jquery.com/jQuery.extend/
        // http://stackoverflow.com/questions/896043/how-can-i-merge-2-javascript-objects-populating-the-properties-in-one-if-they-d
        //// jQuery.extend(settings, ss.storage.settings); // !!! we cannot use this because of review so we have to do it manually:
//      var settings = {
//      enableScanning: true,
//      scannerIncludePatternArray: [ "*" ]
//      };
        // TODO: ok?
        var loadedEnableScanning = ss.storage.settings.enableScanning;
        settings.enableScanning = loadedEnableScanning;  
        
        //// settings.scannerIncludePatternArray = ss.storage.settings.scannerIncludePatternArray; // until v0.981
        // since v0.99.22
        var loadedScannerIncludePatternArray = ss.storage.settings.scannerIncludePatternArray2;
        if (loadedScannerIncludePatternArray != undefined) {
            settings.scannerIncludePatternArray = loadedScannerIncludePatternArray; 
        } // else: use default value
    }

    //// console.log("effective settings: " + JSON.stringify(settings));

    //// console.log(prefs.get("capability.policy.localfilelinks.checkloaduri.enabled"));
    //// console.log(prefs.get("capability.policy.localfilelinks.sites"));
    //// console.log(prefs.get("capability.policy.policynames"));

//  prefs.set("capability.policy.localfilelinks.checkloaduri.enabled", "allAccess");
//  prefs.set("capability.policy.localfilelinks.sites", "http://confluence http://mylocalsite http://site.company.com");
//  prefs.set("capability.policy.policynames", "localfilelinks");

    //// console.log(prefs.get("capability.policy.localfilelinks.checkloaduri.enabled"));
    //// console.log(prefs.get("capability.policy.localfilelinks.sites"));
    //// console.log(prefs.get("capability.policy.policynames"));
}

function cloneViaJson(obj) {
    return JSON.decode(JSON.encode(obj));
} 

function applySettings() {
    //// console.log("applySettings")
    //// console.log(JSON.stringify(settings));

    // https://addons.mozilla.org/en-US/developers/docs/sdk/1.3/packages/addon-kit/docs/page-mod.html#include
    // "Rules can be added to the list by calling its add method and removed by calling its remove method."

    // clear include array
    while (hyperlinkScanner.include.length > 0) {
        hyperlinkScanner.include.remove(hyperlinkScanner.include[0]);
    }
    
    // if scanning is enabled fill it
    if (settings.enableScanning) {
        var arr = settings.scannerIncludePatternArray;
        for (var i in arr) {
            hyperlinkScanner.include.add(arr[i]);
        }
    }
}
