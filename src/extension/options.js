import Vue from 'vue';
import Settings from './components/Settings.js';
import './settings.css';

const optionsApp = new Vue({
    el: '#settings',
    render(h) {
        return h(Settings);
    }
});
