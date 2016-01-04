var self = require( "sdk/self" ),
    pageMod = require( "sdk/page-mod" ),
    array = require( "sdk/util/array" ),
    launcher = require( "./launchExplorer" ),
    prefs = require( "./common/preferences" ),
    CONST = require( "./common/constants" ),
    workers = [],
    attachedCM = false, // Check if context menu is attached.
    mod = {},
    attached = false;

var jqueryScript = "js/jquery-1.11.3.min.js";

var tabs = require( "sdk/tabs" );

/**
 * Pagemode onAttach handler (communication handling to content script
 * and for launching/opening files)
 */
function onAttach( worker ) {

    attached = true; // For unit testing to see that the pageMod is attached

    array.add( workers, worker );

    if ( !attachedCM ) {

        // Add context menu (only if include matches, that's why requiring here)
        require( "./contextMenu" )( function( path, reveal ) { // Callback
            launcher.start( path, reveal );
        } );
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

            // Actions not really needed for one task but during develeopment I had more
            // tasks --> maybe remove it later
            case "open":
                launcher.start( actionObj.url );
            break;
        }

    } );

    worker.port.emit( "initSettings", prefs.options );

    worker.port.emit( "textConstants", CONST );

    // Pageshow / pagehide not needed but we could remove workers if page is hidden
    // could be useful for context menus. --> not needed here
    /*Worker.on('pageshow', function() { array.add(workers, this); });
      worker.on('pagehide', function() { array.remove(workers, this); });
      */

    // Clean worker if it is detached
    worker.on( "detach", function() {
        array.remove( workers, this );
    } );

    function onPrefChange( prefName ) { // Re-name to onEnableLinkChange
        var newEmitObj = {};
        newEmitObj[ prefName ] = prefs.options[ prefName ];

        worker.port.emit( "prefChange", newEmitObj );
    }

    prefs.addPrefChangeHandler( "enableLinkIcons", onPrefChange );
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

function main() {
    createMod(); //First init

    function onWhitelistChange( prefName ) {
        mod.destroy();
        createMod();
    }

    prefs.addPrefChangeHandler( "whitelist", onWhitelistChange );
}

// tabs.open( "http://jsfiddle.net/awolf2904/tefcs74q/" ); // Debugging tab
tabs.open( "127.0.0.1:3000" ); // Debugging tab

function getAttached() {
    return attached;
}

exports.isAttached = getAttached;
exports.main = main;
