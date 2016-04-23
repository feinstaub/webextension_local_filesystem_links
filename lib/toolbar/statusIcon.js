var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var { open } = require("sdk/preferences/utils");
var _ = require("sdk/l10n").get;

/**
 * Create toolbar icon
 * @param initial icon state
 * @return {changeState: function(state) {...}} change state method
 */
function create(iconState) {

    var curState = prepareButton(iconState);

    var button = buttons.ActionButton({
      id: "local-link-addon",
      label: curState.label,
      icon: curState.icon,
      onClick: handleClick
    });

    var statusIcon = {
        changeState: function(state) {
            var newButtonState = prepareButton(state);

            button.label = newButtonState.label;
            button.icon = newButtonState.icon;
        }
    };

    return statusIcon;
}

/**
 * Helper function for easier toggling between active / inactive icon
 */
function prepareButton(iconState) {
    var filePrefix = iconState ? 'active': 'inactive',
        filePrefixLocale = _('LABEL_ADDONBAR_HOVER_STATE_' + filePrefix);

    return {
        label: _('LABEL_ADDONBAR_ICON_HOVER', filePrefixLocale),
        icon: {
          "16": "./img/" + filePrefix + "_icon_16.png",
          "32": "./img/" + filePrefix + "_icon_32.png",
          "64": "./img/" + filePrefix + "_icon_64.png"
        }
    };
}


function handleClick(state) {
    open({ id: self.id });
}

exports.create = create;
