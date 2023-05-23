'use strict';

(function fileLinkAddon($) {
    $.noConflict();

    var fileLinkSelectors = [
            'a[href^="file:"]'
            /*'a[href^="smb://"]',
            'a[href^="afp://"]'*/
        ],
        appTextMessages = {
            // every constant text we're showing the user
            // e.g. tooltip text constants
        },
        $container = $('<span/>'), //$('<span class="aliensun-link-icon"/>'),
        $icon = undefined, // loading, see init
        options = {
            //enableLinkIcons: self.options.enableLinkIcons
        },
        currentIconClass, // folder or arrow?
        disconnectObserver; // function to stop observer

    function updateLinkTooltip() {
        var tooltipText =
            options.revealOpenOption == 'O'
                ? appTextMessages.tooltips.linkText
                : appTextMessages.tooltips.openFolder;

        $('a')
            .filter(fileLinkSelectors.join(', '))
            .attr('title', (i, val) => val || tooltipText);
    }

    /*
     * Activates the plugin - add icon after link and starts observer if enabled
     */
    function activate() {
        if (options.enableLinkIcons) {
            currentIconClass =
                'aliensun-link-icon' +
                (options.revealOpenOption == 'R' ? '-arrow' : '');

            disconnectObserver = createObserver(); // fix later, long running script issue - see issue #109
            $container.addClass(currentIconClass);
            // console.log('added class', $container);

            updateLink($(fileLinkSelectors.join(', ')));
        } else {
            removeLinkIcons();
        }

        // we could add a if case here to add tooltip disable pref.
        updateLinkTooltip();

        // console.log('register events');
        registerEvents(); // important to have this called once per tab to avoid mulitple events on file link
    }

    // Get settings from addon

    browser.runtime.onMessage.addListener(function(
        request,
        sender,
        sendResponse
    ) {
        switch (request.action) {
            case 'ping': // used to test that we're having a connection to the content script
                // console.log('ping receive');
                sendResponse(true);
                break;
            case 'destroy':
                removeLinkIcons();

                // remove tooltips
                $('a')
                    .filter(fileLinkSelectors.join(', '))
                    .attr('title', '');

                // disconnect observer
                disconnectObserver();

                // remove click handler
                unregisterEvents();
                break;
            case 'init':
                appTextMessages = request.data.constants.MESSAGES.USERMESSAGES;
                options = request.data.options; // load options

                if (!$icon) {
                    $icon = $container.append(
                        $('<i/>').addClass('material-icons')
                    );
                }

                // now everything is ready to load
                activate();

                sendResponse({ feedback: 'initDone' });
                break;
            default:
        }
    });

    // Update settings on change of pref.
    function updateIcons(data) {
        options = $.extend({}, options, data);

        removeLinkIcons();
        updateLinkTooltip();

        if (options.enableLinkIcons) {
            updateLink($(fileLinkSelectors.join(', ')));
        }
    }

    // self.port.on('prefChange:enableLinkIcons', updateIcons);
    // self.port.on('prefChange:revealOpenOption', updateIcons);

    // Use delegate so the click event is also avaliable at newly added links
    function registerEvents() {
        $(document).on('click', fileLinkSelectors.join(', '), openFileHandler);

        // icon click handler
        $(document).on(
            'click',
            "[class^='aliensun-link-icon']", // folder or arrow
            openFolderHandler
        );
    }

    function unregisterEvents() {
        $(document).off('click', fileLinkSelectors.join(', '), openFileHandler);
        $(document).off(
            'click',
            "[class^='aliensun-link-icon']",
            openFolderHandler
        );
    }

    function openFileHandler(e) {
        // console.log('event side content script', e);
        e.preventDefault(); // prevent default to avoid browser to launch smb://

        browser.runtime.sendMessage({
            // port.sendMessage({
            action: 'open',
            // removed decodeURIComponent because env. var. failed
            // --> decoding needed for accents
            message: 'hello',
            url: decodeURIComponent(this.href), // this.href
            reveal: options.revealOpenOption == 'O' ? false : true,
            directOpen: options.revealOpenOption == 'D'
        });
    }

    /*
    Event for icon to reveal the folder directly
    */
    function openFolderHandler(e) {
        var link = $(e.currentTarget).data('link');

        e.preventDefault();

        browser.runtime.sendMessage({
            // port.sendMessage({
            action: 'open',
            // removed decodeURIComponent because env. var. failed
            // --> decoding needed for accents (check env. var later)
            message: 'hello',
            url: decodeURIComponent(link),
            reveal: options.revealOpenOption == 'O' ? true : false
        });
    }

    // -------------------------------------------------------------------------
    // add link icons (if enabled)
    //
    // Check at every click if there are new a-tags
    // almost works, there is an issue if the content is loaded
    // with ajax it will fail because at the moment after click
    // there is no new link icon
    //
    // Ideas to add the icons (only needed if we need to add icons to DOM):
    // - add one timeout after click
    //   --> probably the easiest way but it could fails
    //   if the request is taking longer
    // - check if we can detect that all ajax requests are resolved and then
    //   check for updated dom
    // - use mutationObserver will work but could be a lot to execute if there
    //   is many content added to the DOM
    // - use an interval (every second) that's checking if there is a new link
    //
    // A timeout was OK at the beginning because the icons will be checked after
    // any click
    //
    // -->better check if there are new links with an interval if the icons
    //    are enabled.
    //    if they're disabled we don't need an interval
    //    (works also for ajax added content)
    //
    // --> final solution: use jquery-observe that's simplyfing mutationObserver

    function updateLink($element) {
        // console.log('updating', $element);
        var iconTooltip =
            options.revealOpenOption == 'O'
                ? appTextMessages.tooltips.openFolder
                : appTextMessages.tooltips.linkText;

        // update class (folder or arrow)
        currentIconClass =
            'aliensun-link-icon' +
            (options.revealOpenOption == 'R' ? '-arrow' : '');

        $container.removeClass();
        $container.addClass(currentIconClass);

        $element.each(function(index, el) {
            if (
                !$(el)
                    .next()
                    .is('.aliensun-link-icon,.aliensun-link-icon-arrow')
            ) {
                // icon not added
                $icon
                    .attr('title', iconTooltip)
                    .clone()
                    .data('link', $(el).attr('href')) // added to container
                    .insertAfter($(el));
            }
        });
    }

    /*
     * Remove all link icons
     * (needed for updating at icon pref. change)
     */
    function removeLinkIcons() {
        var $icons = $('.aliensun-link-icon, .aliensun-link-icon-arrow');

        $icons.remove();
    }

    /*
     * Create observers for file links
     * Two observers - one for href attributes and
     * another one for newly added file links
     */
    function createObserver() {
        // select target of observe
        var target = document.querySelectorAll(fileLinkSelectors.join(', '));

        // Create an observer instance
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                const $changedEl = $(mutation.target)
                    .filter('a')
                    .filter(fileLinkSelectors.join(', '));

                if (mutation.type === 'attributes') {
                    // observed href change
                    // remove previous icon
                    $changedEl.next('.' + $icon.attr('class')).remove();
                    // add new icons so we have the correct data at the icon
                    updateLink($changedEl);
                } else if (mutation.type === 'childList') {
                    // get elements that are with-out icon - avoid multiple icons
                    let $addedNodes = $(mutation.addedNodes).find(
                        fileLinkSelectors.join(', ')
                    );

                    if ($addedNodes.length == 0) {
                        // no chillds with a file link --> check added element
                        $addedNodes = $(mutation.addedNodes).filter(
                            fileLinkSelectors.join(', ')
                        );
                    }

                    // Check that next element is not a file link icon
                    const $elements = $addedNodes.filter(function() {
                        return !$(this)
                            .next()
                            .is(
                                '.aliensun-link-icon,.aliensun-link-icon-arrow'
                            );
                    });

                    if ($elements.length > 0) {
                        updateLink($elements);
                    }
                }
            });
        });

        // Configure the observer
        var configAttrs = {
            attributeFilter: ['href'] // attributes: true is implied
        };

        // start observation by passing target and config --> href changes only on existing elements
        target.forEach(node => {
            observer.observe(node, configAttrs);
        });

        // observe document for new elements
        observer.observe(document, {
            attributeFilter: ['href'],
            childList: true,
            subtree: true
            // characterData: true
        });

        // return stop function so we can call it if needed
        return () => observer.disconnect();
    }
})(jQuery);
