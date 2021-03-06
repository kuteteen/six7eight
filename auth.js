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
const passport = require("koa-passport");
const PassportLocal = require("passport-local");
const User_1 = require("./entity/User");
const UserSite_1 = require("./entity/UserSite");
const UserAdmin_1 = require("./entity/UserAdmin");
const utils_1 = require("./utils");
const UserBase_1 = require("./entity/UserBase");
const Site_1 = require("./entity/Site");
const LocalStrategy = PassportLocal.Strategy;
const Strateges = {
    platform: '1',
    site: '2',
    local: '3'
};
let strategy;
function fetchUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        switch (strategy) {
            case Strateges.platform:
                user = yield UserAdmin_1.UserAdmin.findById(id);
                break;
            case Strateges.site:
                user = yield UserSite_1.UserSite.findById(id);
                break;
            case Strateges.local:
                user = yield User_1.User.findById(id);
                break;
        }
        return user;
    });
}
passport.serializeUser((user, done) => {
    done(null, user.id + strategy);
});
passport.deserializeUser((info, done) => __awaiter(this, void 0, void 0, function* () {
    let id = info.substr(0, info.length - 1);
    strategy = info.substr(-1, 1);
    try {
        const user = yield fetchUserById(id);
        if (user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
    catch (err) {
        done(err);
    }
}));
passport.use('platform', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => __awaiter(this, void 0, void 0, function* () {
    strategy = Strateges.platform;
    let request = req;
    try {
        if (request.session.captcha !== request.body.securityCode) {
            done(new Error('验证码错误'));
        }
        else {
            let user = yield UserAdmin_1.UserAdmin.findByName(username);
            if (user && utils_1.comparePass(password, user.password)) {
                if (user.getState === UserBase_1.UserState.Ban) {
                    done(new Error('账户: ' + user.username + ' 已被禁用了!'));
                }
                else {
                    done(null, user);
                }
            }
            else {
                done(new Error('账户名或密码错误!'));
            }
        }
    }
    catch (e) {
        done(e);
    }
})));
passport.use('site', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => __awaiter(this, void 0, void 0, function* () {
    strategy = Strateges.site;
    let request = req;
    try {
        if (request.session.captcha !== request.body.securityCode) {
            done(new Error('验证码错误'));
        }
        else {
            let user = yield UserSite_1.UserSite.findByNameWithSite(username, request.hostname);
            if (user && utils_1.comparePass(password, user.password)) {
                let site = user.site;
                if (site.getState === Site_1.SiteState.Ban) {
                    done(new Error('站点: ' + site.name + ' 已被禁用!'));
                }
                else {
                    if (user.getState === UserBase_1.UserState.Ban) {
                        done(new Error('账户: ' + user.username + ' 已被禁用了!'));
                    }
                    else {
                        done(null, user);
                    }
                }
            }
            else {
                done(new Error('账户名或密码错误!'));
            }
        }
    }
    catch (e) {
        done(e);
    }
})));
passport.use('user', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => __awaiter(this, void 0, void 0, function* () {
    strategy = Strateges.local;
    let request = req;
    try {
        if (request.session.captcha !== request.body.securityCode) {
            done(new Error('验证码错误'));
        }
        else {
            let user = yield User_1.User.findByNameWithSite(username, request.hostname);
            if (user && utils_1.comparePass(password, user.password)) {
                if (user.getState === UserBase_1.UserState.Ban) {
                    done(new Error('账户: ' + user.username + ' 已被禁用了!'));
                }
                else {
                    done(null, user);
                }
            }
            else {
                done(new Error('账户名或密码错误!'));
            }
        }
    }
    catch (e) {
        done(e);
    }
})));
//# sourceMappingURL=auth.js.map