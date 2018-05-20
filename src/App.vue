<template>
  <div id="app" class="aliensun-wrapper">
    <div class="col-narrow">
      <img src="img/active_icon_64.png">
    </div>
    <div class="col-wide">
      <h1>{{ appName }}</h1>
      <a href="#" @click="displaySettings">Change settings...</a> <!-- i18n not added yet -->
      <hr/>
      <a href="#" @click="showInstallInfo">Show install info</a>
      <!-- new feature button to append url to whitelist -->
    </div>
    <!-- <h2>Settings</h2> -->
  </div>
</template>

<script>
export default {
  name: "app",
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
        .sendMessage({ action: "showInstallInfoTab" })
        .then(function(response) {
          // console.log('showInstallInfo done', response)
        })
        .catch(function(err) {
          // console.log('error', err);
        });
    }
  }
};
</script>
