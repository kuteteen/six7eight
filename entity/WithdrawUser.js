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
const WithdrawBase_1 = require("./WithdrawBase");
const User_1 = require("./User");
const Site_1 = require("./Site");
let WithdrawUser = class WithdrawUser extends WithdrawBase_1.WithdrawBase {
};
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.withdraws),
    __metadata("design:type", User_1.User)
], WithdrawUser.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Site_1.Site, site => site.withdrawsUser),
    __metadata("design:type", Site_1.Site)
], WithdrawUser.prototype, "site", void 0);
WithdrawUser = __decorate([
    typeorm_1.Entity()
], WithdrawUser);
exports.WithdrawUser = WithdrawUser;
//# sourceMappingURL=WithdrawUser.js.map