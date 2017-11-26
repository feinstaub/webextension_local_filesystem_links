<template>
    <div>
      <!-- TODO: check how to apply styles from FF -->
      <label class="detail-row-label" for="whitelist">Whitelist
      <input id="whitelist"
        type="text"
        class="detail-row-value"
        name="whitelist"
        v-model="settings.whitelist"
        @input="updateSetting" />
      </label>
      <p v-if="statusMsg"><strong>{{statusMsg}}</strong></p>
      <pre>{{settings}}</pre>
    </div>
</template>

<script>
  import _ from 'lodash';
  import {defaultSettings} from '../common/constants';

  const DEBOUNCE_TIME = 500; // delay saving by 500ms (reduce saving as you type)
  const STATUS_TIME = 1000; // flash duration

  export default {
    data() {
      return  {
        settings: defaultSettings,
        statusMsg: undefined,
        loaded: false
      };
    },
    created() {
      this.load()
    },
    methods: {
      // plain(data) { // removes reactive data props
      //   return JSON.parse(JSON.stringify(data));
      // },
      updateSetting: _.debounce(function(evt) {
        this.save(evt);
      }, DEBOUNCE_TIME),

      getObj(obj) {
        return JSON.parse(JSON.stringify(obj)); // remove reactive getters/setters
      },

      save (e) {
        //this.settings[e.target.name] = e.target.value;
        //console.log('saving', this.settings, this.getObj(this.settings));
        // chrome.storage.sync.set(this.colorSettings, () => {
        // const update = {};
        // update[SETTINGS_KEY] = this.colorSettings;

        browser.storage.local.set(this.getObj(this.settings)).then(() => {
          // Update status to let user know options were saved.
          console.log('saved!', browser.storage.local);
          this.statusMsg = 'Options saved.';
          browser.runtime.sendMessage({
            action: 'updateContentPages'
          });

          setTimeout(() => {
            this.statusMsg = '';
          }, STATUS_TIME);
        }).catch((err) => {
          this.statusMsg = err;
        });
      },

      load() {
        // return {colorSettings: defaultColor};
        // Use default value color = 'red' and likesColor = true.
        // chrome.storage.local.get(defaultColor,
        console.log('load defaults', defaultSettings, this.getObj(defaultSettings))
        browser.storage.local.get(this.getObj(defaultSettings)).then(
          (items) => {
            console.log('loaded', items);
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
