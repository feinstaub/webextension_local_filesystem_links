let notifyCount = 0;
const CAKE_INTERVAL = 0.1;
const cakeNotification = 'webextension-local-filesystem-links-notification';

function notify(title, message) {
    notifyCount++;
    const id = `${cakeNotification}-${notifyCount}`;

    // console.log('notify', id, browser.notifications);
    browser.notifications.create(
        id,
        {
            type: 'basic',
            iconUrl: browser.extension.getURL('img/active_icon_64.png'),
            title: title || browser.runtime.getManifest().name,
            message: message
        }).then(() => {
            // console.log('cake created', arguments);
            setTimeout(() => {
                // console.log('cake cleared');
                browser.notifications.clear(id);
            }, 2000);
        });
}

export default notify;
