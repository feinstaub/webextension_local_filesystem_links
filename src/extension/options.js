import Vue from 'vue';
import Settings from './components/Settings.vue';
import './settings.css';

const optionsApp = new Vue({
    el: '#settings',
    render(h) {
        return h(Settings);
    }
});
