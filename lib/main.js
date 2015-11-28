/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const contextMenu = require("sdk/context-menu");
const pageMod = require("sdk/page-mod");
const prefs = require("sdk/preferences/service");
const request = require("sdk/request");
const selection = require("sdk/selection");
const self = require("sdk/self");
const data = require("sdk/self").data;
const ss = require("sdk/simple-storage");
const simple_prefs = require("sdk/simple-prefs").prefs;
const tabs = require("sdk/tabs");
const localProcess = require("./launch-local-process");
const linkUtil = require("./link-util");
const osUtil = require("./os-util");
// const translate = require("./translate-demo"); // removed, single language is OK, maybe add it later
const widgetMain = require("./widget-main");
const notifications = require("sdk/notifications");

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
    selfVersion: self.version,
    enableScanning: true,
    enableDynamicScanning: true,
    scannerIncludePatternArray: [ "*", "file://*" ]
};

/*
var onMessageFunc = function(obj) {
    let text = obj[0];
    let lang = obj[1];

    translate.translate(text, lang, onTranslationComplete);
};

var onTranslationComplete = function(translated) {
    //// console.log("getAllProperties(selection)");
    //// console.log(getAllProperties(selection).join("\n"));

    selection.text = translated;
*/
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
/* // removed for now
    selection.html = "<span style=\"background-color:#aaffaa\">" + selection.html + "</span>";
};*/

//
// MAIN
//
exports.main = function(options, callbacks) {

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
            console.log('context path', message); // not working in FF 42 --> message is empty
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
        include: settings.scannerIncludePatternArray,
        contentScriptWhen: "ready",
        contentScriptFile:
            [data.url(jqueryFilename),
             data.url("json2DOM.js"),
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
                    fileManagerDisplayName: osUtil.getFileManagerDisplayName(),
                    excludeUrlStartsWithList: simple_prefs.excludeUrlStartsWithList
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

            worker.port.on("documenturl_ignored", function(excludeItem) {
                widgetMain.updateCurrentPageInfo(excludeItem);
            }),

            worker.port.on("href", function(href) {
                let path = href;
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

    // open localhost for test links (for debugging only)
    //tabs.open('localhost:8125'); //local webserver debugging
};

var userAlertCouldNotOpenPath = function(path) {
    showMessageBox("Failed to open link!", "Local Filesystem Links:\n\nSorry. The following path could not be found:\n\n" + path);
};

/**
 * Show message box in the currently open tab
 * @param {string} The text to be displayed
 */
var showMessageBox = function(title, text) {
    /*var worker = tabs.activeTab.attach({
        contentScript:
            // convert text to "safe string"
            'window.alert(unescape("' + escape(text) + '"))'
    });

    worker.destroy();*/
    notifications.notify({
      title: title,
      text: text
    });
};

//
// usage examples:
//   print(getAllProperties(obj));
//   getAllProperties(Math).filter(function(o) { print(o); });
//
var getAllProperties = function(obj) {
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

var detachWorker = function(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if (index != -1) {
        // index    Required. An integer that specifies at what position to add/remove elements
        // howmany  Required. The number of elements to be removed. If set to 0, no elements will be removed
        // This method changes the original array!
        // http://www.w3schools.com/jsref/jsref_splice.asp
        workerArray.splice(index, 1);
    }
};

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

exports.onUnload = function(reason) {
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
};

//write settings to persistent storage
var persistSettings = function() {
    //// console.log("persistSettings")
    ss.storage.settings = settings;
};

//loads the settings from persistent storage
//If there is no storage yet, just keep the default settings
//otherwise overwrite the default settings

//WARN: call only once because we are giving a ref to toolbar-panel-main
var loadSettings = function() {
    //// console.log("storage: " + JSON.stringify(ss.storage.settings));
    //// console.log("defaults: " + JSON.stringify(settings));

    if (ss.storage.settings !== undefined) {
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
        if (loadedScannerIncludePatternArray !== undefined) {
            settings.scannerIncludePatternArray = loadedScannerIncludePatternArray;
        } // else: use default value
    }
    else {
        ////upgradeSettings(self.version, null); // TODO: test
        ////settings.selfVersion = self.version;
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
};

// TODO: implement later
var upgradeSettings = function(newVersion, oldVersion) {
    // TODO: write code here to upgrade if version has changed
};

var cloneViaJson = function(obj) {
    return JSON.decode(JSON.encode(obj));
};

var applySettings = function() {
    //Bug? In FX 39+ see https://bugzilla.mozilla.org/show_bug.cgi?id=1189781. Page mod settings now longer get applied
    //This prevents enableScanning from taking affect

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
            if(arr.hasOwnProperty(i)) {
                hyperlinkScanner.include.add(arr[i]);
            }
            else {
                console.error(i + " not a property of " + arr);
            }
        }
    }
};