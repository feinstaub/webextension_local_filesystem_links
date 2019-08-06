import withRender from './app.html';

export default withRender({
    name: 'app',
    data() {
        return {
            appName: browser.runtime.getManifest().name
        };
    },
    methods: {
        displaySettings() {
            browser.runtime.openOptionsPage();
        },
        showInstallInfo() {
            // console.log('show tab...', browser.runtime.sendMessage);
            browser.runtime
                .sendMessage({ action: 'showInstallInfoTab' })
                .then(function(response) {
                    // console.log('showInstallInfo done', response)
                })
                .catch(function(err) {
                    // console.log('error', err);
                });
        }
    }
});
