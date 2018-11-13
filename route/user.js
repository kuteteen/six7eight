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
const Router = require("koa-router");
const passport = require("passport");
const debuger = require("debug");
const UserBase_1 = require("../entity/UserBase");
const utils_1 = require("../utils");
const CUser_1 = require("../controler/CUser");
const CFeedbackUser_1 = require("../controler/CFeedbackUser");
const CRechargeCode_1 = require("../controler/CRechargeCode");
const Recharge_1 = require("../entity/Recharge");
const CRecharge_1 = require("../controler/CRecharge");
const CWithdraw_1 = require("../controler/CWithdraw");
const Withdraw_1 = require("../entity/Withdraw");
const CSite_1 = require("../controler/CSite");
const RightUser_1 = require("../entity/RightUser");
const CProductTypeSite_1 = require("../controler/CProductTypeSite");
const CProductSite_1 = require("../controler/CProductSite");
const COrderUser_1 = require("../controler/COrderUser");
const CConsumeUser_1 = require("../controler/CConsumeUser");
const debug = debuger('six7eight:route-user');
const userAuth = new Router();
function userRoutes(router) {
    return __awaiter(this, void 0, void 0, function* () {
        router.post('/user/login', (ctx) => __awaiter(this, void 0, void 0, function* () {
            const params = ctx.request.body;
            const captcha = ctx.session.captcha;
            if (captcha === params.securityCode) {
                return passport.authenticate('user', (err, user, info, status) => __awaiter(this, void 0, void 0, function* () {
                    if (user) {
                        ctx.login(user);
                        yield CUser_1.CUser.updateLoginTime({ id: user.id, time: utils_1.now() });
                        ctx.body = new utils_1.MsgRes(true, '登录成功！', user);
                    }
                    else {
                        ctx.body = new utils_1.MsgRes(false, '用户名或密码错误！');
                    }
                }))(ctx, () => {
                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                });
            }
            else {
                ctx.body = new utils_1.MsgRes(false, '验证码错误！');
            }
        }));
        router.get('/user/init/data', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let site = yield CSite_1.CSite.findByAddress(ctx.request.hostname);
            let siteName = site.name;
            let rights = yield RightUser_1.RightUser.findTrees();
            let products = yield CProductTypeSite_1.CProductTypeSite.getAllWithProducts(site.id);
            let result = products.concat(rights[0].children);
            ctx.body = new utils_1.MsgRes(true, '', { siteName: siteName, rights: result });
        }));
        router.get('/user/product/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CProductSite_1.CProductSite.findById(ctx.params.id));
        }));
        router.post('/file/upload', utils_1.default.single('file'), (ctx) => __awaiter(this, void 0, void 0, function* () {
            let req = ctx.req;
            ctx.body = ctx.origin + '/uploads/' + req.file.filename;
        }));
        router.use('/user/auth/*', (ctx, next) => {
            if (ctx.isAuthenticated() && ctx.state.user.type === UserBase_1.UserType.User) {
                return next();
            }
            else {
                ctx.body = new utils_1.MsgRes(false, '请登录后操作！');
            }
        });
        userAuth.get('/logout', (ctx) => {
            ctx.logout();
            ctx.body = new utils_1.MsgRes(true, '退出登录');
        });
        userAuth.get('/orders/:productId', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.findOrdersByUserAndProduct(ctx.params.productId, ctx.state.user.id));
        }));
        userAuth.post('/order/add', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            let info = ctx.request.body;
            info.user = user;
            info.site = user.site;
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.add(ctx.request.body));
        }));
        userAuth.get('/user/info/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.findById(ctx.params.id));
        }));
        userAuth.post('/user/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.updateInfo(ctx.request.body));
        }));
        userAuth.post('/compare/pass', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let body = ctx.request.body;
            let password = body.password;
            ctx.body = new utils_1.MsgRes(true, '', utils_1.comparePass(password, ctx.state.user.password));
        }));
        userAuth.post('/change/pass', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.changePass(Object.assign({ user: ctx.state.user }, ctx.request.body)));
        }));
        userAuth.get('/recharge/code', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let info = {
                type: Recharge_1.RechargeType.User,
                user: ctx.state.user,
                site: ctx.state.user.site,
            };
            ctx.body = new utils_1.MsgRes(true, '', yield CRechargeCode_1.CRechargeCode.getOne(info));
        }));
        userAuth.post('/alipayId/exist', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CRecharge_1.CRecharge.findByAlipayId(ctx.request.body));
        }));
        userAuth.post('/recharge/add', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let info = ctx.request.body;
            let user = ctx.state.user;
            let params = {
                alipayId: info.alipayId,
                type: Recharge_1.RechargeType.User,
                way: Recharge_1.RechargeWay.Hand,
                user: user,
                userSite: null,
                site: user.site
            };
            ctx.body = new utils_1.MsgRes(true, '', yield CRecharge_1.CRecharge.addOrRecharge(params));
        }));
        userAuth.get('/recharge/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CRecharge_1.CRecharge.userAll(ctx.state.user.id));
        }));
        userAuth.get('/consume/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CConsumeUser_1.CConsumeUser.all(ctx.state.user.id));
        }));
        userAuth.get('/user/funds', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', ctx.state.user.funds);
        }));
        userAuth.post('/withdraw/add', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let info = ctx.request.body;
            let user = ctx.state.user;
            let params = {
                alipayCount: info.alipayCount,
                alipayName: info.alipayName,
                funds: info.funds,
                type: Withdraw_1.WithdrawType.User,
                user: user,
                userSite: undefined,
                site: user.site
            };
            ctx.body = new utils_1.MsgRes(true, '', yield CWithdraw_1.CWithdraw.add(params));
        }));
        userAuth.get('/withdraw/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CWithdraw_1.CWithdraw.userAll(ctx.state.user.id));
        }));
        userAuth.get('/lower/users', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.lowerUserAll(user.id, user.site.id));
        }));
        userAuth.get('/lower/user/:username/exist', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.findByNameAndSiteId(ctx.params.username, ctx.state.user.site.id));
        }));
        userAuth.post('/lower/user/save', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            let info = ctx.request.body;
            info.parent = user;
            info.site = user.site;
            info.role = yield user.role.getLowerRole(user.site.id);
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.saveLower(info));
        }));
        userAuth.post('/lower/user/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.updateLower(ctx.request.body));
        }));
        userAuth.get('/lower/user/del/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.delById(ctx.params.id));
        }));
        userAuth.get('/feedbacks', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.userGetAll(user.id, user.site.id));
        }));
        userAuth.post('/feedback/add', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            let info = ctx.request.body;
            info.user = user;
            info.site = user.site;
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.add(info));
        }));
        userAuth.post('/feedback/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.update(ctx.request.body));
        }));
        userAuth.get('/feedback/del/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.delById(ctx.params.id));
        }));
        router.use('/user/auth', userAuth.routes(), userAuth.allowedMethods());
    });
}
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.js.map