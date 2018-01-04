<template>
    <div>
      <!-- whitelist setting -->
      <label class="title" for="whitelist">{{whitelistTitle}}</label>
      <div class="container">
        <p class="description">
          {{whitelistDescription}}
        </p>
        <input id="whitelist"
          type="text"
          name="whitelist"
          v-model="settings.whitelist" />
      </div>

      <!-- <hr/> -->
      <!-- Enable executables -->
      <label class="title" for="enableExe">{{enableExecutablesTitle}}</label>
      <div class="container">
        <p class="description">
          <input id="enableExe"
            type="checkbox"
            name="enabelExe"
            v-model="settings.enableExecutables"/>
            <span @click="toggleExecutables()">{{enableExecutablesDescription}}</span>
        </p>
      </div>
      <!-- <hr/> -->

      <!-- Enable link icons -->
      <label class="title" for="enableLinkIcons">{{enableLinkIconsTitle}}</label>
      <div class="container">
        <p class="description">
          <input id="enableLinkIcons"
            type="checkbox"
            name="enableLinkIcons"
            v-model="settings.enableLinkIcons"/>
            <span @click="toggleLinkIcon()">{{enableLinkIconsDescription}}</span>
        </p>
      </div>
      <!-- <hr/> -->

      <!-- Default link click behaviour -->
      <label class="title" for="revealOpenOption">{{revealOpenOptionTitle}}</label>
      <div class="container">
        <label for="revealOpenOption"><input id="revealOpenOption"
          type="radio"
          name="defaultClickRadio"
          value="O"
          v-model="settings.revealOpenOption"/>{{revealOpenOptionTexts.o}}
        </label>
        <label for="revealOpenOption_r">
        <input
            type="radio"
            id="revealOpenOption_r"
            name="defaultClickRadio"
            value="R"
            v-model="settings.revealOpenOption"/>{{revealOpenOptionTexts.r}}
        </label>
        <!--
        Disable direct open at the moment - fix later. Issue with privileges.
        It's saying something like 'invalid url - file://...'
        More details see here at prop. url: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create
        <label for="revealOpenOption_d">
        <input
          id="revealOpenOption_d"
          type="radio"
          name="defaultClickRadio"
          value="D"
          v-model="settings.revealOpenOption"/>{{revealOpenOptionTexts.d}}
        </label> -->
        <p class="description">
          {{revealOpenOptionDescription}}
        </p>
      </div>
      <p v-if="statusMsg"><strong>{{statusMsg}}</strong></p>
      <!-- <pre>{{settings}}</pre> -->
      <!-- <hr/> -->
    </div>
</template>

<script>
  import _ from 'lodash';
  import {defaultSettings} from '../constants';

  const DEBOUNCE_TIME = 500; // delay saving by 500ms (reduce saving as you type)
  const STATUS_TIME = 2000; // flash duration

  export default {
    data() {
      const getI18n = browser.i18n.getMessage;
      return  {
        whitelistTitle: getI18n('whitelist_title'),
        whitelistDescription: getI18n('whitelist_description'),
        enableExecutablesTitle: getI18n('enableExecutables_title'),
        enableExecutablesDescription: getI18n('enableExecutables_description'),
        enableLinkIconsTitle: getI18n('enableLinkIcons_title'),
        enableLinkIconsDescription: getI18n('enableLinkIcons_description'),
        revealOpenOptionTitle: getI18n('revealOpenOption_title'),
        revealOpenOptionDescription: getI18n('revealOpenOption_description'),
        revealOpenOptionTexts: {
          'o': getI18n('revealOpenOption_options_Open'),
          'r': getI18n('revealOpenOption_options_Reveal'),
          'd': getI18n('revealOpenOption_options_Direct')
        },
        settings: defaultSettings,
        statusMsg: undefined,
        loaded: false
      };
    },
    created() {
      this.load();
    },
    watch: {
      settings:
      {
        handler(val, old) {
          this.updateSetting();
        },
        deep: true
      }
    },
    methods: {
      updateSetting: _.debounce(function() {
        this.save();
      }, DEBOUNCE_TIME),

      getObj(obj) {
        return JSON.parse(JSON.stringify(obj)); // remove reactive getters/setters
      },

      save () {
        const settings = this.getObj(this.settings);

        browser.storage.local.set(settings).then(() => {
          // Update status to let user know options were saved.
          // console.log('saved!', browser.storage.local);
          this.statusMsg = 'Options saved.';
          let updateActionObj = Object.assign({},
          {
            action: 'updateContentPages',
          }, settings);

          // browser.runtime.sendMessage(updateActionObj);

          setTimeout(() => {
            this.statusMsg = '';
          }, STATUS_TIME);
        }).catch((err) => {
          this.statusMsg = err;
        });
      },
      toggleExecutables() {
        this.settings.enableExecutables = !this.settings.enableExecutables;
      },
      toggleLinkIcon() {
        this.settings.enableLinkIcons = !this.settings.enableLinkIcons;
      },
      load() {
        // return {colorSettings: defaultColor};
        // Use default value color = 'red' and likesColor = true.
        // chrome.storage.local.get(defaultColor,
        // console.log('load defaults', defaultSettings, this.getObj(defaultSettings))
        browser.storage.local.get(this.getObj(defaultSettings)).then(
          (items) => {
            // console.log('loaded', items);
            // alert(JSON.stringify(items))
            this.settings = items || defaultSettings;
            this.loaded = true;
          })
          .catch((err) => {
              this.statusMsg = `Error: ${err}`;
          });
      }
    }
  }
</script>

<style scoped lang="scss">
  // variables
  $indent: 2%;

  /* globals for the component */
  input[type="text"] {
    width: 100%;
    padding: 5px;
    margin-top: 16px;
  }

  input[type="radio"] {
    margin-bottom: 6px;
  }

  p {
    margin: 0;
  }
  // setting styles
  .title {
    font-size: 20px;
    font-weight: bold;
    padding: 6px;
  }
  .description {
    font-size: 14px;
  }
  .container {
    margin-left: $indent;
    padding-top: 8px;
    margin-bottom: 16px;
  }
</style>
