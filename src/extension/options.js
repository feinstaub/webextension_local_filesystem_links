import Vue from 'vue';
import Settings from './components/Settings.vue';

const optionsApp = new Vue({
    el: '#settings',
    render(h) {
        return h(Settings);
    }
});
