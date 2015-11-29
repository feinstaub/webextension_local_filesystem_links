"use strict";

( function fileLinkAddon( $, self ) {

    var fileLinkSelectors = [ 'a[href^="file://"]', 'a[href^="smb://"]' ],

        //RegExLinks = /{^(file|smb):\/\/}/i,
        $icon = $( "<i/>" )
            .addClass( "material-icons link-icon" ),
        options = {
            enableLinkIcons: self.options.enableLinkIcons
        };

    var REFRESH_INTERVAL = 1000; // Check links every 1000ms

    /**
     * Activates the plugin - add icon after link and starts interval if enabled
     */
    function activate() {
        if ( options.enableLinkIcons ) {
            startLinkEnhancer();
        }
    }

    activate();

    self.port.on( "initSettings", function( data ) {
        console.log( "init settings" );

        //$.extend( options, data ); // Update options
        options.enableLinkIcons = data.enableLinkIcons;
        console.log( options, data );
    } );

    self.port.on( "prefChange", function( data ) {
        console.log( "prefchange", data );

        // $.extend( options, data ); // Update options
        options.enableLinkIcons = data.enableLinkIcons;

        startLinkEnhancer();
    } );

    // Use delegate so the click event is also avaliable at newly added links
    $( document ).on( "click", fileLinkSelectors.join( ", " ), function( e ) {
        e.preventDefault(); // prevent default to avoid browser to launch smb://
        console.log( "clicked file link: " + this.href );
        self.postMessage( {
            action: "open",
            url: decodeURIComponent( this.href )
        } );
    } );

    // Check at every click if there are new a-tags
    // almost works, there is an issue if the content is loaded with ajax it will fail
    // because at the moment after click there is no new link icon
    //
    // Ideas to add the icons (only needed if we need to add icons to DOM):
    // - add one timeout after click --> probably the easiest way but it could fails
    //   if the request is taking longer
    // - check if we can detect that all ajax requests are resolved and then check for updated dom
    // - use mutationObserver will work but could be a lot to execute if there is many
    //   content added to the DOM
    // - use an interval (every second) that's checking if there is a new link
    //
    // One timeout was OK at the beginning because the icons will be checked after any click
    //
    // -->better check if there are new links with an interval if the icons are enabled.
    //    if they're disabled we don't need an interval (works also for ajax added content)
    //
    // Todo:
    // - check if we need to limit the count of intervals (every pageMod will add an interval)
    //   --> multiple pageMods are possible for a tab (e.g. for every iframe)

    function checkLinks() {

        var $newLinks = $( fileLinkSelectors.join( ", " ) )
            .not( ":has(>i.link-icon)" );

        if ( $newLinks.length > 0 && options.enableLinkIcons ) {
            console.log( $newLinks.length );
            $newLinks.append( $icon.clone() );
        }

        startLinkEnhancer(); // Checks if link icons are enable
    }

    function startLinkEnhancer() {
        if ( options.enableLinkIcons ) {

            // Only add icons if the option is enabled,
            // if disabled only link will be clickable.
            setTimeout( checkLinks, REFRESH_INTERVAL );
        }
    }
    /*
    // I don't like the behavior with click event
    // becasuse there are no icons if the links are loaded with ajax.
    $(document).on('click', function() {
        console.log('clicked document!!');
        checkLinks();

        // if ( !checkLinks() ) {
            // recheck once more after a timeout //<<<<<<<<<<<<<<<<<<<not working at trello
            // links are working at trello but the icon is not showing!!!
            // <<<<<<<<<<<<check if timeout is executed after 5 seconds!

    //        setTimeout(checkLinks, 5000); // 2seconds
    //    }
    });
    */

    // Ajax events not working, probably global events disabled in trello or
    // we can't listen to trello's ajax
    // $(document).ajaxSuccess(function() {
    //     console.log('ajax stopped');
    //     checkLinks();
    // });

}( jQuery, window.self ) );
