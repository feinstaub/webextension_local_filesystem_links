import notify from './notify';

/** Show installation guid tab
  * @returns {undefined}
  */
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
/** Check if this is the first run of the extension & show install guide
  * @param {object} details info to the current installation reason
  * @returns {undefined}
  */
function checkInstallation(details) {
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
