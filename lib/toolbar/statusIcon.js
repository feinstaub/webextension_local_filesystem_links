var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var { open } = require("sdk/preferences/utils");

function create(iconState) {

    var curState = prepareButton(iconState);

    var button = buttons.ActionButton({
      id: "local-link-addon",
      label: curState.label,
      icon: curState.icon,
      onClick: handleClick
    });

    return {
        changeState: function(state) {
            var newButtonState = prepareButton(state);

            button.label = newButtonState.label;
            button.icon = newButtonState.icon;
        }
    };
}

function prepareButton(iconState) {
    var filePrefix = '';
    if (iconState) {
        filePrefix = 'active';
    } else {
        filePrefix = 'inactive';
    }

    return {
        label: "Local link addon (filelinks " + filePrefix + ")",
        icon: {
          "16": "./img/" + filePrefix + "-icon-16.png",
          "32": "./img/" + filePrefix + "-icon-32.png",
          "64": "./img/" + filePrefix + "-icon-64.png"
        }
    };
}


function handleClick(state) {
    open({ id: self.id });
}

exports.create = create;
