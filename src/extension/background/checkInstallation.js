// script for checking if this is the first start
// 1st start --> show installation guide

export function showInstallationTab() {
    let query = browser.tabs.query({
        currentWindow: true,
        url: 'moz-extension://*/installed.html'
    });

    query.then((tabs) => {
        if (tabs.length > 0) {
            browser.tabs.update(
                tabs[0].id,
                {
                    active: true
                }
            );
        } else {
            browser.tabs.create({
                active: true,
                url: '/installed.html'
            });
        }
    });
}

function checkInstallation(details, notify) {
    // notify('in func', 'installed');
    if(details.reason == 'install') {
        // console.log('This is a first install!');
        // show installation guide
        // notify('test', 'first install');
        showInstallationTab();
    } else if(details.reason == 'update') {
        // nothing special todo here at the moment.
        let thisVersion = browser.runtime.getManifest().version;

        // notify('version', thisVersion);
        // console.log('Updated from ' + details.previousVersion + ' to ' +
        //   thisVersion + '!');
    }
};

export default checkInstallation;
