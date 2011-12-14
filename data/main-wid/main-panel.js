console.log("main-panel.htm loaded");

self.port.on("load", function() {
  onLoad();
});

function onLoad() {
  console.debug("main-panel load");

  $("a").button();
  
  $("#button_ok").click(function() {
    console.debug("o")
    self.port.emit("button_ok");
    return false;
  });
      
  $("#button_cancel").click(function() {
    console.debug("c")
    self.port.emit("button_cancel");
    return false;
  });     
}