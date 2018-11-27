import Vuex from "vuex";
import Vue from "vue";
import Storage, { StorageKey, addTypeToMenu, addProductToMenu, typeOrProductUpdate } from "@/utils";
Vue.use(Vuex);
var store = new Vuex.Store({
    state: (function () {
        var info = Storage.getItem(StorageKey.site);
        return info ? info : {};
    })(),
    mutations: {
        saveInfo: function (state, data) {
            Vue.set(state, 'user', data.user);
            Vue.set(state, 'rights', data.rights);
        },
        logout: function (state) {
            state = null;
        },
        changeSiteName: function (state, siteName) {
            state.user.site.name = siteName;
        },
        addTypeToMenu: function (state, type) {
            state.user.role.rights.unshift(type.id);
            addTypeToMenu(state.rights, type);
        },
        addProductToMenu: function (state, data) {
            var treeRights = state.rights, typeId = data.typeId, product = data.product;
            addProductToMenu(treeRights, typeId, product);
            var rights = state.user.role.rights;
            for (var i = 0; i < rights.length; i++) {
                if (rights[i] === typeId) {
                    rights.splice(i, 1);
                    break;
                }
            }
            rights.unshift(product.id);
        },
        typeOrProductUpdate: function (state, data) {
            typeOrProductUpdate(state.rights, data);
        },
        changeRights: function (state, data) {
            state.rights = data.menuRights;
            state.user.role.name = data.roleName;
            state.user.role.rights = data.rights;
        },
        changeUserState: function (state, userState) {
            state.user.state = userState;
        },
        changeUserRole: function (state, data) {
            state.rights = data.menuRights;
            state.user.role = data.role;
        }
    }
});
export default store;
//# sourceMappingURL=store.js.map