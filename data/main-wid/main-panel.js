console.log("main-panel.htm loaded");

self.port.on("load", function() {
  onLoad();
});

function onLoad() {
  console.debug("main-panel load");

  $("a").button();
  
  $("#button_ok").click(function() {
    console.debug("o")
    self.port.emit("button_ok", getSettingsDataFromPage());
    return false;
  });
      
  $("#button_cancel").click(function() {
    console.debug("c")
    self.port.emit("button_cancel");
    return false;
  });
  
  self.port.emit("request_data");
}

self.port.on("fresh_data", function(data) {
  $("#checkEnableScanning").prop("checked", data.enableScanning);
});

// reads all settings from the page and
// returns an data object that will be passed to the ok method
function getSettingsDataFromPage() {
  return {
    // http://api.jquery.com/category/selectors/
    enableScanning: $("#checkEnableScanning").is(":checked")
  };
}
