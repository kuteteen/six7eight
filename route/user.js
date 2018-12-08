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
const Platform_1 = require("../entity/Platform");
const CRoleUser_1 = require("../controler/CRoleUser");
const debug = debuger('six7eight:route-user');
const userAuth = new Router();
function userRoutes(router) {
    return __awaiter(this, void 0, void 0, function* () {
        router.get('/user/all/products/price', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let platform = yield Platform_1.Platform.find();
            let site = yield CSite_1.CSite.findByAddress(ctx.hostname);
            let products = yield CProductTypeSite_1.CProductTypeSite.productsPrice(site.id);
            let priceRoles = yield CRoleUser_1.CRoleUser.productPriceRoles(site.id);
            ctx.body = new utils_1.MsgRes(true, '', {
                products: products,
                priceRoles: priceRoles,
                goldUpPrice: platform.goldUpPrice,
                superUpPrice: platform.superUpPrice,
            });
        }));
        router.get('/user/all/placards', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CSite_1.CSite.getUserPlacards(ctx.request.hostname));
        }));
        router.get('/user/check/:username/exist', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.findByName(ctx.params.username));
        }));
        router.post('/user/register', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let { username, password, rePassword, securityCode } = ctx.request.body;
            utils_1.assert(username, '用户名不能为空!');
            utils_1.assert(password, '账户密码不能为空!');
            utils_1.assert(securityCode, '验证码不能为空!');
            utils_1.assert(password === rePassword, '两次输入的密码不一致!');
            const captcha = ctx.session.captcha;
            utils_1.assert(captcha === securityCode, '验证码错误!');
            let site = yield CSite_1.CSite.findByAddress(ctx.request.hostname);
            utils_1.assert(site, '你访问的分站不存在!');
            yield CUser_1.CUser.saveLower({
                username: username,
                password: password,
                parent: null,
                site: site
            });
            ctx.body = new utils_1.MsgRes(true);
        }));
        router.post('/user/login', passport.authenticate('user'), (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.getUserLoginInitData(user));
        }));
        router.get('/user/init/data', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let site = yield CSite_1.CSite.findByAddress(ctx.request.hostname);
            if (!site) {
                throw new Error('您访问的分站不存在！');
            }
            let productMenus = yield CProductTypeSite_1.CProductTypeSite.productsRight(site.id);
            let rightMenus = yield RightUser_1.RightUser.findTrees();
            let permissions = yield RightUser_1.RightUser.getAllPermissions();
            let platform = yield Platform_1.Platform.find();
            ctx.body = new utils_1.MsgRes(true, '', {
                siteId: site.id,
                siteName: site.name,
                productMenus: productMenus,
                rightMenus: rightMenus,
                permissions: permissions,
                canSiteRegister: site.canRegister,
                canRegister: platform.canRegister,
                canAddUser: platform.canAddUser
            });
        }));
        router.get('/user/product/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CProductSite_1.CProductSite.findById(ctx.params.id));
        }));
        router.post('/file/upload', utils_1.default.single('file'), (ctx) => __awaiter(this, void 0, void 0, function* () {
            let req = ctx.req;
            ctx.body = ctx.origin + '/uploads/' + req.file.filename;
        }));
        router.get('/user/logined', (ctx) => {
            if (ctx.isAuthenticated() && ctx.state.user.type === UserBase_1.UserType.User) {
                ctx.body = new utils_1.MsgRes(true);
            }
            else {
                ctx.body = new utils_1.MsgRes(false, '请登录后操作！');
            }
        });
        router.use('/user/auth/*', (ctx, next) => {
            if (ctx.isAuthenticated() && ctx.state.user.type === UserBase_1.UserType.User) {
                return next();
            }
            else {
                ctx.body = new utils_1.MsgRes(false, '请登录后操作！');
            }
        });
        userAuth.get('/logout', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.logout();
            ctx.body = new utils_1.MsgRes(false, '退出登录！');
        }));
        userAuth.get('/up/role/:userId', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.upUserRole(ctx.params.userId, ctx.io));
        }));
        userAuth.get('/orders/:productId', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.findUserOrdersByProductId(ctx.params.productId, ctx.state.user.id));
        }));
        userAuth.post('/order/add', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            let info = ctx.request.body;
            info.user = user;
            info.site = user.site;
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.add(ctx.request.body, ctx.io));
        }));
        userAuth.post('/order/add/error', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.addError(ctx.request.body, ctx.io));
        }));
        userAuth.get('/order/:orderId/errors', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.getErrors(ctx.params.orderId));
        }));
        userAuth.get('/see/errors/of/:orderId', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield COrderUser_1.COrderUser.seeErrors(ctx.params.orderId));
        }));
        userAuth.get('/user/info/:id', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.findById(ctx.params.id));
        }));
        userAuth.post('/user/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.updateSelfContact(ctx.request.body));
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
            ctx.body = new utils_1.MsgRes(true, '', yield CRecharge_1.CRecharge.addOrRecharge(params, ctx.io));
        }));
        userAuth.get('/recharge/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CRecharge_1.CRecharge.userAll(ctx.state.user.id));
        }));
        userAuth.get('/consume/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CConsumeUser_1.CConsumeUser.all(ctx.state.user.id));
        }));
        userAuth.get('/get/withdraw/min', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let platform = yield Platform_1.Platform.find();
            ctx.body = new utils_1.MsgRes(true, '', platform.userWithdrawMin);
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
            ctx.body = new utils_1.MsgRes(true, '', yield CWithdraw_1.CWithdraw.add(params, ctx.io));
        }));
        userAuth.get('/withdraw/records', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CWithdraw_1.CWithdraw.userAll(ctx.state.user.id));
        }));
        userAuth.get('/lower/users', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.lowerUserAll(ctx.state.user.id));
        }));
        userAuth.get('/lower/user/:username/exist', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.findByName(ctx.params.username));
        }));
        userAuth.post('/lower/user/save', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let user = ctx.state.user;
            let info = ctx.request.body;
            info.parent = user;
            info.site = user.site;
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.saveLower(info));
        }));
        userAuth.post('/lower/user/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CUser_1.CUser.updateOtherContact(ctx.request.body, ctx.io));
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
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.add(info, ctx.io));
        }));
        userAuth.post('/feedback/update', (ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = new utils_1.MsgRes(true, '', yield CFeedbackUser_1.CFeedbackUser.update(ctx.request.body));
        }));
        router.use('/user/auth', userAuth.routes(), userAuth.allowedMethods());
    });
}
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.js.map