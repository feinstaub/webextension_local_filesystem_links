var self = require( "sdk/self" ),
    pageMod = require( "sdk/page-mod" ),
    array = require( "sdk/util/array" ),
    launcher = require( "./launch-local-process" ),
    prefs = require( "./common/preferences" ),
    CONST = require( "./common/constants" ),
    workers = [],
    attachedCM = false, // Check if context menu is attached.
    mod = {},
    attached = false,
    statusIcon = require('./toolbar/statusIcon').create(false),
    tabs = require( "sdk/tabs" ),
    { isUriIncluded } = require('./utils/matchUrl');

var jqueryScript = "js/jquery-1.11.3.min.js",
    jqueryObserveScript = "js/jquery-observe.js";

/**
 * Pagemode onAttach handler (communication handling to content script
 * and for launching/opening files)
 */
function onAttach( worker ) {

    attached = true; // For unit testing to see that the pageMod is attached

    // statusIcon.changeState(true); // change status icon to active

    array.add( workers, worker );

    if ( !attachedCM ) {

        // Add context menu (only if include matches, that's why requiring here)
        require( "./contextMenu" )( function( path, reveal ) { // Callback
            launcher.start( path, reveal );
        } );

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
    worker.on( "message", function( actionObj ) {

        switch ( actionObj.action ) {

            // Actions from content-script
            case "open":
                launcher.start( actionObj.url );
            break;

            case "reveal":
                launcher.start( actionObj.url, true);
            break;
        }

    } );

    worker.port.emit( "init", prefs.options, CONST );

    // Pageshow / pagehide not needed but we could remove workers if page is hidden
    // could be useful for context menus. --> not needed here
    /*Worker.on('pageshow', function() { array.add(workers, this); });
      worker.on('pagehide', function() { array.remove(workers, this); });
      */

    // Clean worker if it is detached
    worker.on( "detach", function() {
        array.remove( workers, this );
    } );

    function onPrefLinkChange( prefName ) {
        var newEmitObj = {};
        newEmitObj[ prefName ] = prefs.options[ prefName ];

        // console.log('pref link change', newEmitObj, prefName);
        worker.port.emit( "prefLinkIconChange", newEmitObj );
    }

    prefs.addPrefChangeHandler( "enableLinkIcons", onPrefLinkChange );
}

/**
 * Creates a new pageMod.
 * Required as a function so we can re-create the pageMod on whitelist preference changes.
 */
function createMod() {

    var whitelist = prefs.options.whitelist || "*";

    mod = pageMod.PageMod( {
        include: whitelist.split( /\s+/ ),

        //AttachTo: 'top', // multiple attachments needed if there are iframes
                           // pageMod can be attached multiple times!!!
        contentScriptOptions: {
            enableLinkIcons: prefs.options.enableLinkIcons
        },
        contentScriptFile: [

            // Vendor scripts
            self.data.url( jqueryScript ),

            // jquery plugin
            self.data.url( jqueryObserveScript ),

            // Custom scripts
            self.data.url( "js/fileLinkAddonContent.js" )
        ],
        contentStyleFile: [

            // Custom styles
            "./css/style.css",

            // Css libs
            "./css/self-hosted-materialize.css"
        ],
        onAttach: onAttach
    } );
}

/**
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

    function onWhitelistChange( prefName ) {
        mod.destroy();
        createMod();
    }

    prefs.addPrefChangeHandler( "whitelist", onWhitelistChange );
}

//tabs.open( "http://jsfiddle.net/awolf2904/tefcs74q/" ); // Debugging tab
//tabs.open( "127.0.0.1:3000" ); // Debugging tab

function getAttached() {
    return attached;
}

exports.isAttached = getAttached;
exports.main = main;
