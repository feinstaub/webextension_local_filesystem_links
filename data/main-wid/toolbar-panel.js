var currentPageInfo = null;

$("a").button();

$("#button_options").click(function() {
    //// console.log("debug: button_options click")
    self.port.emit("show_options");
    return false;
});

$("#button_rescan").click(function() {
    //// console.log("debug: button_options click")
    self.port.emit("action_rescan_page");
    return false;
});

self.on("message", function(message) {

    var message_data = message.data;
    
    if (message.type === "fresh_data") { // always called when the popup opens
        setDisplay($("#statusEnabled"), message_data.enableScanning);
        setDisplay($("#statusDisabled"), !message_data.enableScanning);

        // reset visibility
        setVisibility($("#statusUrlIgnoredLi"), false);
        setVisibility($("#statusUrlIgnoredMsg"), false);
	// apply visibility if scanning enabled
        if (message_data.enableScanning) {
           applyCurrentPageInfo();
        }

        $("#versionText").text(message_data.selfVersion);
    }
    else if (message.type === "updateCurrentPageInfo") { // always called when the page is refreshed
      currentPageInfo = message_data;
      applyCurrentPageInfo();
    }
});

function applyCurrentPageInfo() {
      let show = currentPageInfo !== null; // TODO: also show which element matched using the data passed by updateCurrentPageInfo
      setVisibility($("#statusUrlIgnoredLi"), show);
      setVisibility($("#statusUrlIgnoredMsg"), show);  
}

// hide as if not present
function setDisplay(elem, show) {
    if (show) {
        elem.css('display', 'inline');
    }
    else {
        elem.hide();
    }
}

// hides but keeps reserving the layout space
function setVisibility(elem, show) {
    if (show) {
        elem.css('visibility', 'visible');
    }
    else {
        elem.css('visibility', 'hidden');
    }
}
