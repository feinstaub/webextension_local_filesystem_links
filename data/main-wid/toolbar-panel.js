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
  
  if (message.type === "fresh_data") {
    var data = message.data;
    
    showElement($("#statusDisabled"), !data.enableScanning);
    showElement($("#statusInactive"), data.enableScanning && false); // TODO
    showElement($("#statusActive"), data.enableScanning);    
  }
});

function showElement(elem, show) {
  if (show) {
    elem.show();
  }
  else {
    elem.hide();
  }
}
