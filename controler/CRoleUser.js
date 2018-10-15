"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RoleUser_1 = require("../entity/RoleUser");
class CRoleUser {
    static save(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = new RoleUser_1.RoleUser();
            role.name = info.name;
            role.type = info.type;
            role.rights = info.rights;
            role.site = info.site;
            return yield role.save();
        });
    }
    static allRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RoleUser_1.RoleUser.getAll();
        });
    }
    static saveOne(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = new RoleUser_1.RoleUser();
            role.name = info.name;
            role.rights = info.rights;
            return yield role.save();
        });
    }
    static update(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = new RoleUser_1.RoleUser();
            role.name = info.name;
            role.rights = info.rights;
            return yield RoleUser_1.RoleUser.update(info.id, role);
        });
    }
    static delById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = yield RoleUser_1.RoleUser.findByIdWithRelations(id);
            if (role.users && role.users.length > 0) {
                throw (new Error('该角色上有关联的账户，不能删除！'));
            }
            else {
                yield RoleUser_1.RoleUser.delById(id);
            }
        });
    }
}
exports.CRoleUser = CRoleUser;
//# sourceMappingURL=CRoleUser.js.map