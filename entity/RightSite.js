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
var RightSite_1;
"use strict";
const typeorm_1 = require("typeorm");
const RightBase_1 = require("./RightBase");
const utils_1 = require("../utils");
let RightSite = RightSite_1 = class RightSite extends RightBase_1.RightBase {
    static p() {
        return typeorm_1.getRepository(RightSite_1);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightSite_1.p().save(this);
        });
    }
    static findByName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightSite_1.p().findOne({ name: username });
        });
    }
    ;
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightSite_1.p().findOne(id);
        });
    }
    ;
    static update(id, right) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightSite_1.p().update(id, right);
        });
    }
    static tree() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RightSite_1.p().createQueryBuilder('right')
                .where('right.pId = :pId', { pId: '0' })
                .leftJoinAndSelect('right.children', 'menu')
                .leftJoinAndSelect('menu.children', 'menuItem')
                .getMany();
        });
    }
    static findTrees() {
        return __awaiter(this, void 0, void 0, function* () {
            let rightTree = yield RightSite_1.tree();
            utils_1.sortRights(rightTree);
            return rightTree;
        });
    }
    static getAllPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            let tree = yield RightSite_1.tree();
            let permissions = [];
            utils_1.getPermission(tree, permissions);
            return permissions;
        });
    }
};
__decorate([
    typeorm_1.ManyToOne(type => RightSite_1, rightSite => rightSite.children, {
        cascade: true
    }),
    __metadata("design:type", RightSite)
], RightSite.prototype, "parent", void 0);
__decorate([
    typeorm_1.OneToMany(type => RightSite_1, rightSite => rightSite.parent),
    __metadata("design:type", Array)
], RightSite.prototype, "children", void 0);
RightSite = RightSite_1 = __decorate([
    typeorm_1.Entity()
], RightSite);
exports.RightSite = RightSite;
//# sourceMappingURL=RightSite.js.map