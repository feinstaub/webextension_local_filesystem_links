// Notifications.js
// var notifications = require('sdk/notifications');

/*
 * Show notification
 * @param {string} Title of the notifcation
 * @param {string} Text of the message
 */
exports.show = function(title, text) {
    browser.notifications.create('', {
        title: title,
        text: text
    });
};
