import Vuex from "vuex";
import Vue from "vue";
import { addTypeToMenu, addProductToMenu, typeOrProductUpdate, findMenu, changeMenuWaitCount } from "@/utils";
import { StorageKey, Storage } from "@/slfstorage";
import { sortMenus } from "../commons/utils";
Vue.use(Vuex);
var store = new Vuex.Store({
    state: (function () {
        var info = Storage.getItem(StorageKey.site);
        return info ? info : {};
    })(),
    mutations: {
        login: function (state, data) {
            Vue.set(state, 'userId', data.userId);
            Vue.set(state, 'username', data.username);
            Vue.set(state, 'userState', data.userState);
            Vue.set(state, 'roleId', data.roleId);
            Vue.set(state, 'roleName', data.roleName);
            Vue.set(state, 'roleType', data.roleType);
            Vue.set(state, 'permissions', data.permissions);
            Vue.set(state, 'menus', data.menus);
            Vue.set(state, 'magProducts', data.magProducts);
            Vue.set(state, 'siteId', data.siteId);
            Vue.set(state, 'siteName', data.siteName);
            Vue.set(state, 'funds', data.funds);
            Vue.set(state, 'freezeFunds', data.freezeFunds);
            Vue.set(state, 'messageNum', data.messageNum);
            state.menus = sortMenus(state.menus);
        },
        logout: function (state) {
            Storage.removeItem(StorageKey.site);
        },
        changeMessageNum: function (state, messageNum) {
            state.messageNum = messageNum;
        },
        minusMessageNum: function (state) {
            state.messageNum -= 1;
        },
        plusMessageNum: function (state) {
            state.messageNum += 1;
        },
        plusBadge: function (state, aim) {
            changeMenuWaitCount(state.menus, aim, function (itemA, itemB) {
                itemA.waitCount++;
                if (itemB) {
                    itemB.waitCount++;
                }
            });
        },
        plusOrderErrorBadge: function (state, data) {
            if (state.magProducts.includes(data.productId)) {
                changeMenuWaitCount(state.menus, data.fingerprint, function (itemA, itemB) {
                    itemA.waitCount++;
                    if (itemB) {
                        itemB.waitCount++;
                    }
                });
            }
        },
        minusBadge: function (state, aim) {
            changeMenuWaitCount(state.menus, aim, function (itemA, itemB) {
                itemA.waitCount = itemA.waitCount > 0 ? --itemA.waitCount : 0;
                if (itemB) {
                    itemB.waitCount = itemB.waitCount > 0 ? --itemB.waitCount : 0;
                }
            });
        },
        minusOrderErrorBadge: function (state, data) {
            if (state.magProducts.includes(data.productId)) {
                changeMenuWaitCount(state.menus, data.fingerprint, function (itemA, itemB) {
                    itemA.waitCount = itemA.waitCount > 0 ? --itemA.waitCount : 0;
                    if (itemB) {
                        itemB.waitCount = itemB.waitCount > 0 ? --itemB.waitCount : 0;
                    }
                });
            }
        },
        changeSiteName: function (state, siteName) {
            state.siteName = siteName;
        },
        addTypeToMenu: function (state, type) {
            state.permissions.unshift(type.id);
            addTypeToMenu(state.menus, type);
            state.menus = sortMenus(state.menus);
        },
        addProductToMenu: function (state, data) {
            var product = data.product;
            state.magProducts.push(product.id);
            addProductToMenu(state.menus, data.typeId, product);
            state.permissions.unshift(product.id);
            state.menus = sortMenus(state.menus);
        },
        typeOrProductUpdate: function (state, data) {
            typeOrProductUpdate(state.menus, data);
            state.menus = sortMenus(state.menus);
        },
        changeRights: function (state, data) {
            state.menus = data.menuRights;
            state.roleName = data.roleName;
            state.permissions = data.rights;
            state.menus = sortMenus(state.menus);
        },
        changeUserState: function (state, userState) {
            state.userState = userState;
        },
        changeUserRole: function (state, data) {
            state.menus = data.menuRights;
            state.roleId = data.role.id;
            state.roleType = data.role.type;
            state.roleName = data.role.name;
            state.permissions = data.role.rights;
            state.menus = sortMenus(state.menus);
        },
        changeFunds: function (state, funds) {
            state.funds = funds;
        },
        changeFreezeFunds: function (state, freezeFunds) {
            state.freezeFunds = freezeFunds;
        },
        changeFundsAndFreezeFunds: function (state, data) {
            state.funds = data.funds;
            state.freezeFunds = data.freezeFunds;
        }
    }
});
export function logout() {
    store.commit('logout');
}
export function isLogin() {
    return store.state.userId;
}
export function getMenu(path, isId) {
    return findMenu(store.state.menus, path, isId);
}
export function hasPermission(fingerprint) {
    return store.state.permissions.some(function (item) {
        return item === fingerprint;
    });
}
export default store;
//# sourceMappingURL=store.js.map