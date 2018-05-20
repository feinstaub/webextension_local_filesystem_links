
import debounce from "lodash.debounce";
import { defaultSettings } from "../constants";
import withRender from './Settings.html';

const DEBOUNCE_TIME = 500; // delay saving by 500ms (reduce saving as you type)
const STATUS_TIME = 2000; // flash duration

export default withRender({
  data() {
    const getI18n = browser.i18n.getMessage;
    return {
      whitelistTitle: getI18n("whitelist_title"),
      whitelistDescription: getI18n("whitelist_description"),
      enableExecutablesTitle: getI18n("enableExecutables_title"),
      enableExecutablesDescription: getI18n("enableExecutables_description"),
      enableLinkIconsTitle: getI18n("enableLinkIcons_title"),
      enableLinkIconsDescription: getI18n("enableLinkIcons_description"),
      revealOpenOptionTitle: getI18n("revealOpenOption_title"),
      revealOpenOptionDescription: getI18n("revealOpenOption_description"),
      revealOpenOptionTexts: {
        o: getI18n("revealOpenOption_options_Open"),
        r: getI18n("revealOpenOption_options_Reveal"),
        d: getI18n("revealOpenOption_options_Direct")
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
    settings: {
      handler(val, old) {
        this.updateSetting();
      },
      deep: true
    }
  },
  methods: {
    updateSetting: debounce(function() {
      this.save();
    }, DEBOUNCE_TIME),

    getObj(obj) {
      return JSON.parse(JSON.stringify(obj)); // remove reactive getters/setters
    },

    save() {
      const settings = this.getObj(this.settings);

      browser.storage.local
        .set(settings)
        .then(() => {
          // Update status to let user know options were saved.
          // console.log('saved!', browser.storage.local);
          this.statusMsg = "Options saved.";
          let updateActionObj = Object.assign(
            {},
            {
              action: "updateContentPages"
            },
            settings
          );

          // browser.runtime.sendMessage(updateActionObj);

          setTimeout(() => {
            this.statusMsg = "";
          }, STATUS_TIME);
        })
        .catch(err => {
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
      browser.storage.local
        .get(this.getObj(defaultSettings))
        .then(items => {
          // console.log('loaded', items);
          // alert(JSON.stringify(items))
          this.settings = items || defaultSettings;
          this.loaded = true;
        })
        .catch(err => {
          this.statusMsg = `Error: ${err}`;
        });
    }
  }
});
