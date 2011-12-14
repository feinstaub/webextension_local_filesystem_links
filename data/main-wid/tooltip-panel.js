console.log("tooltip-panel.htm loaded");
$("a").button();
        
$("#button_options").click(function() {
  console.debug("button_options click")
  self.port.emit("show_options");
  // self.hide(); // TODO: hide after click.
  return false;
})
