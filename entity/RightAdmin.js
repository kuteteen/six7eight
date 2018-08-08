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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var RightAdmin_1;
"use strict";
const typeorm_1 = require("typeorm");
const RightBase_1 = require("./RightBase");
let RightAdmin = RightAdmin_1 = class RightAdmin extends RightBase_1.RightBase {
    static p() {
        return typeorm_1.getRepository(RightAdmin_1);
    }
    static treeP() {
        return typeorm_1.getManager().getTreeRepository(RightAdmin_1);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.p().save(this);
        });
    }
    static findTrees() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.treeP().findTrees();
        });
    }
    static find(op) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.p().find(op);
        });
    }
    static findByName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.p().findOne({ name: username });
        });
    }
    ;
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.p().findOne(id);
        });
    }
    ;
    static delById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightAdmin_1.p().delete(id);
        });
    }
};
__decorate([
    typeorm_1.TreeParent(),
    __metadata("design:type", RightAdmin)
], RightAdmin.prototype, "parent", void 0);
__decorate([
    typeorm_1.TreeChildren(),
    __metadata("design:type", Array)
], RightAdmin.prototype, "children", void 0);
RightAdmin = RightAdmin_1 = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Tree('closure-table')
], RightAdmin);
exports.RightAdmin = RightAdmin;
//# sourceMappingURL=RightAdmin.js.map