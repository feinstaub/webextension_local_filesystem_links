<template>
  <div id="app">
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
  name: 'app',
  data () {
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
      browser.runtime.sendMessage({action: 'showInstallInfoTab'}).then(function(response) {
          // console.log('showInstallInfo done', response)
      }).catch(function(err) {
          // console.log('error', err);
      });
    }
  }
}
</script>

<style scoped lang="scss">
// globals
/* apply a natural box layout model to all elements, but allowing components to change */
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
div {
  margin: 0;
  padding: 10px 5px;
  width: 300px;
}
h1, h2 {
  font-weight: normal;
  margin: 0;
}
h1 {
  font-size: 16px;
}

a {
  color: #42b983;
}

img {
  text-align: center;
}

// collumns
.col-narrow {
  float: left;
  width: 25%;
}
.col-wide {
  float: left;
  width: 75%
}

hr {
  border-color: AliceBlue;
}
</style>
