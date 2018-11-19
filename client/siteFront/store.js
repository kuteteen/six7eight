import Vuex from "vuex";
import Vue from "vue";
import Storage, { StorageKey, addTypeToMenu, addProductToMenu, typeOrProductUpdate } from "@/utils";
Vue.use(Vuex);
var store = new Vuex.Store({
    state: (function () {
        var state = Storage.getItem(StorageKey.user);
        return state ? state : {};
    })(),
    mutations: {
        saveInitData: function (state, data) {
            Vue.set(state, 'siteId', data.siteId);
            Vue.set(state, 'siteName', data.siteName);
            Vue.set(state, 'typeRights', data.typeRights);
            Vue.set(state, 'rights', data.rights);
        },
        saveUser: function (state, user) {
            Vue.set(state, 'user', user);
        },
        clearUser: function (state) {
            state.user = null;
        },
        updateUsername: function (state, username) {
            state.user.username = username;
        },
        addTypeToMenu: function (state, type) {
            addTypeToMenu(state.typeRights, type);
        },
        addProductToMenu: function (state, data) {
            addProductToMenu(state.typeRights, data.typeId, data.product);
        },
        typeOrProductUpdate: function (state, data) {
            typeOrProductUpdate(state.typeRights, data);
        },
    }
});
export default store;
//# sourceMappingURL=store.js.map