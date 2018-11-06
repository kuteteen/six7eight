import Vuex from "vuex";
import Vue from "vue";
import Storage, { StorageKey } from "@/utils";
Vue.use(Vuex);
var store = new Vuex.Store({
    state: (function () {
        var state = Storage.getItem(StorageKey.user);
        return state ? state : {};
    })(),
    mutations: {
        saveUser: function (state, user) {
            state.user = user;
        },
        clearUser: function (state) {
            state.user = null;
        },
        updateUsername: function (state, username) {
            state.user.username = username;
        }
    }
});
export default store;
//# sourceMappingURL=store.js.map