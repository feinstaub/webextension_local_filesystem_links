var self = require( "sdk/self" ),
    pageMod = require( "sdk/page-mod" ),
    array = require( "sdk/util/array" ),
    launcher = require( "./launchExplorer" ),
    prefs = require( "./common/preferences" ),
    workers = [],
    attachedCM = false, // Check if context menu is attached.
    intervalIds = []; //Store the interval ids in addon

var jqueryScript = "js/jquery-1.11.3.min.js";

var tabs = require( "sdk/tabs" );

function main() {
    pageMod.PageMod( {
        include: prefs.whiteList || "*",

        // Todo: Check if white list works
        //attachTo: 'top', // multiple attachments needed if there are iframes
                           // pageMod can be attached multiple times!!!
        //contentScript: contentScriptValue,
        contentScriptOptions: {
            intervalIds: intervalIds,
            enableLinkIcons: prefs.options.enableLinkIcons
        },
        contentScriptFile: [

            // Vendor scripts
            self.data.url( jqueryScript ),

            // Custom scripts
            self.data.url( "js/fileLinkAddonContent.js" )
        ],
        contentStyleFile: [
            "./css/style.css",

            // Css libs
            "./css/self-hosted-materialize.css"

            // './css/materialize.css'
            // './css/font-awesome.min.css'
        ],
        onAttach: function( worker ) {

            array.add( workers, worker );

            if ( !attachedCM ) {

                // Add context menu (only if include matches, that's why requiring here)
                require( "./contextMenu" )( function( path, reveal ) { // Callback
                    launcher.start( path, reveal );
                } );
                attachedCM = true; // Needed because onAttach can be executed multiple times
            }

            // Worker events
            /**
            * Contentscript message
            * check action:
            *   - open: starts windows explorer with a fixed path (no file:// etc)
            *   - storeInterval: stores the id of the icon intervals
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

            function onPrefChange( prefName ) {
                var newEmitObj = {};
                newEmitObj[ prefName ] = prefs.options[ prefName ];

                worker.port.emit( "prefchange", newEmitObj );
            }

            prefs.addPrefChangeHandler( "enableLinkIcons", onPrefChange );

            // Pageshow / pagehide not needed but we could remove workers if page is hidden
            // could be useful for context menus. --> not needed here
            /*Worker.on('pageshow', function() { array.add(workers, this); });
              worker.on('pagehide', function() { array.remove(workers, this); });
              */

            // Clean worker if it is detached
            worker.on( "detach", function() { array.remove( workers, this ); } );
        }
    } );

    tabs.open( "http://jsfiddle.net/awolf2904/tefcs74q/" ); // Debugging tab
    tabs.open( "http://localhost:3000" ); // Debugging tab

    /*Tabs.on("ready", function () {
      console.log("tab loaded");
    });*/
}

exports.main = main;
