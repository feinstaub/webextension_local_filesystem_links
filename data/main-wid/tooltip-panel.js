console.log("tooltip-panel.htm loaded");
$("a").button();
        
$("#button_options").click(function() {
  console.debug("button_options click")
  self.port.emit("show_options");
  return false;
});

self.on("message", function(message) {
  
  if (message.type === "fresh_data") {
    var data = message.data;
    
    showElement($("#statusDisabled"), !data.enableScanning);
    showElement($("#statusInactive"), data.enableScanning && false);
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
