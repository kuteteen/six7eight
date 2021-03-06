"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const utils_1 = require("../utils");
class RoleBase {
    constructor() {
        this.editRights = [];
        this.rights = [];
    }
    treeRights(tree) {
        function tagRight(right, aim) {
            if (right.fingerprint === aim) {
                right.saved = true;
                return true;
            }
            else if (right.children && right.children.length > 0) {
                let children = right.children;
                for (let i = 0; i < children.length; i++) {
                    if (tagRight(children[i], aim)) {
                        right.saved = true;
                        return true;
                    }
                }
            }
        }
        function delRight(rights) {
            return rights.filter((val) => {
                if (val.saved) {
                    if (val.children && val.children.length > 0) {
                        val.children = delRight(val.children);
                    }
                    return true;
                }
            });
        }
        for (let i = 0; i < this.rights.length; i++) {
            let aim = this.rights[i];
            for (let j = 0; j < tree.length; j++) {
                tagRight(tree[j], aim);
            }
        }
        return delRight(tree);
    }
    addProductTypeToRights(typeId) {
        this.editRights.unshift(typeId);
        this.rights.unshift(typeId);
    }
    addProductToRights(typeId, productId) {
        let index = this.editRights.indexOf(typeId);
        if (index !== -1) {
            this.editRights.splice(index, 1);
        }
        this.editRights.unshift(productId);
        this.rights.unshift(productId);
    }
}
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], RoleBase.prototype, "id", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: 'timestamp',
        transformer: { from(dVal) {
                return utils_1.myDateFromat(dVal);
            }, to(eVal) {
                return eVal;
            } },
        readonly: true
    }),
    __metadata("design:type", String)
], RoleBase.prototype, "createTime", void 0);
__decorate([
    typeorm_1.Column('simple-array'),
    __metadata("design:type", Array)
], RoleBase.prototype, "editRights", void 0);
__decorate([
    typeorm_1.Column('simple-array'),
    __metadata("design:type", Array)
], RoleBase.prototype, "rights", void 0);
exports.RoleBase = RoleBase;
//# sourceMappingURL=RoleBase.js.map