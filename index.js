var self = require('sdk/self'),
    pageMod = require('sdk/page-mod'),
    array = require('sdk/util/array'),
    launcher = require('./lib/launch-local-process'),
    simplePrefs = require('sdk/simple-prefs'),
    CONST = require('./lib/common/constants'),
    workers = [],
    attachedCM = false, // Check if context menu is attached.
    mod = {},
    attached = false,
    statusIcon = require('./lib/toolbar/statusIcon').create(false),
    tabs = require('sdk/tabs'),
    {isUriIncluded} = require('./lib/utils/matchUrl'),
    {env} = require('sdk/system/environment'),
    strUtils = require('./lib/utils/string-util'),
    sysenv = require('./lib/system-env-vars'),
    curSysEnv = sysenv();

var jqueryScript = 'js/jquery-2.2.4.min.js',
    jqueryObserveScript = 'js/jquery-observe.js';

/*
* Pagemode onAttach handler (communication handling to content script
* and for launching/opening files)
*/
function onAttach(worker) {

    attached = true; // For unit testing to see that the pageMod is attached

    // statusIcon.changeState(true); // change status icon to active

    array.add(workers, worker);

    if (!attachedCM) {
        // Add context menu (only if include matches, that's why requiring here)
        require('./lib/contextMenu')(function(path, reveal) { // Callback
            // console.log('launcher start - context menu', path);
            launcher.start(path, reveal);
        });

        // // add icon to display that we have enabled links on page
        // statusIcon.changeState(true);
        attachedCM = true; // Needed because onAttach
        // can be executed multiple times
    }

    // Worker events
    /**
    * Contentscript message
    * check action:
    *   - open: starts windows explorer with a fixed path (no file:// etc)
    */
    worker.on('message', function(actionObj) {
        var replacedLink = curSysEnv.checkLink(actionObj.url);

        // prepare linux path with ~/ to a correct url that FF can handle
        // info: windows path e.g. c:\~\temp is no problem because only file:///~/ will be replaced
        actionObj.url = actionObj.url.
            replace(/file:[\/]+~\//, strUtils.
                strFormat('file:///{0}/', [env['HOME']]));
        //console.log(env['HOME'], actionObj.url);

        if (simplePrefs.prefs.revealOpenOption === 'D' &&
            actionObj.action === 'open') {
            tabs.open(replacedLink);
        } else {
            if (actionObj.backslashReplaceRequired) {
                // special handling required at icon click
                replacedLink = replacedLink.replace(/\\/g, '/'); // replace backslashes

                // we need to check if file has 2 slashes because ff won't fix it
                replacedLink = replacedLink.replace(/file:[\/]{2,3}/i,
                    'file:\/\/\/');
            }

            // check if default is open or reveal
            if (simplePrefs.prefs.revealOpenOption === 'R' &&
                simplePrefs.prefs.revealOpenOption !== 'D') {
                // change logic
                if (actionObj.action === 'open') {
                    actionObj.action = 'reveal';
                } else {
                    actionObj.action = 'open';
                }
            }

            switch (actionObj.action) {
            // Actions from content-script
            case 'open':
                launcher.start(replacedLink);
                break;

            case 'reveal':
                launcher.start(replacedLink, true);
                break;
            default:
                break;
            }
        }
    });

    worker.port.emit('init', simplePrefs.prefs, CONST);
    // Pageshow / pagehide not needed but we could remove workers if page is
    // hidden could be useful for context menus. --> not needed here
    /*Worker.on('pageshow', function() { array.add(workers, this); });
    worker.on('pagehide', function() { array.remove(workers, this); });
    */

    // Clean worker if it is detached
    worker.on('detach', function() {
        array.remove(workers, worker); //this);

        // remove prefChangeHandlers
        simplePrefs.removeListener('enableLinkIcons', onPrefLinkChange);
        simplePrefs.removeListener('revealOpenOption', onPrefLinkChange);
    });

    function onPrefLinkChange(prefName) {
        var newEmitObj = {};

        newEmitObj[ prefName ] = simplePrefs.prefs[ prefName ];

        // @info: no checks if worker exists needed here because we're
        //        removing the prefChange Listener with worker detach event.
        worker.port.emit('prefChange:' + prefName, newEmitObj);
    }

    // register simplePref events
    simplePrefs.on('enableLinkIcons', onPrefLinkChange);
    simplePrefs.on('revealOpenOption', onPrefLinkChange);
}

/*
* Creates a new pageMod.
* Required as a function so we can re-create the pageMod on whitelist
* preference changes.
*/
function createMod() {

    var whitelist = simplePrefs.prefs.whitelist || '*';

    mod = pageMod.PageMod({
        include: whitelist.split(/\s+/),
        //AttachTo: 'top', // multiple attachments needed if there are iframes
        // pageMod can be attached multiple times!!!
        contentScriptOptions: {
            enableLinkIcons: simplePrefs.prefs.enableLinkIcons
        },
        contentScriptFile: [
            // Vendor scripts
            self.data.url(jqueryScript),

            // jquery plugin
            self.data.url(jqueryObserveScript),

            // Custom scripts
            self.data.url('js/fileLinkAddonContent.js')
        ],
        contentStyleFile: [
            // Custom styles
            './css/style.css',

            // Css libs
            './css/self-hosted-materialize.css'
        ],
        onAttach: onAttach
    });
}

/*
* Tab event handler for status icon
* state = true --> green icon = links active in current tab
* state = false --> red icon = links active in current tab
*/
function checkStatus() {
    // if uri matches include change state to true
    // console.log('checkStatus: ', tabs.activeTab.url, mod.include);
    statusIcon.changeState(isUriIncluded(mod.include,
        tabs.activeTab.url));
}

// register event handlers for statusIcon
tabs.on('activate', checkStatus);
tabs.on('pageshow', checkStatus);

function main() {
    createMod(); //First init

    function onWhitelistChange(/* prefName */) {
        // mod.include = prefs.options[prefName].split(/\s+/);
        // updating would be OK but pageMod keeps active
        // after removal from wl.
        mod.destroy();
        createMod();
    }

    simplePrefs.on('whitelist', onWhitelistChange);
}

//tabs.open('http://jsfiddle.net/awolf2904/tefcs74q/'); // Debugging tab
//tabs.open('127.0.0.1:3000'); // Debugging tab

function getAttached() {
    return attached;
}

exports.isAttached = getAttached;
exports.main = main;
