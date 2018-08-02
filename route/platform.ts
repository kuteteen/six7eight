import * as Router from "koa-router";
import {Context} from "koa";
import passport = require("koa-passport");
import * as debuger from "debug";
import {LoginRes} from "../utils";

const debug = debuger('six7eight:route_platform');
const platformAuth = new Router();

export async function platformRoute(router: Router) {

    /* 登录页面 */
    router.get('/platform', async (ctx: Context) => {
        await ctx.render('platform');
    });

    /* 登录入口 */
    router.post('/platform/login', async (ctx: Context) => {
        const params:any = ctx.request.body;
        const captcha = ctx.session!.captcha;
        if (captcha === params.securityCode) {
            return passport.authenticate('platform', (err, user, info, status) => {
                console.log(JSON.stringify(user), '----------------------------');
                if (user) {
                    ctx.login(user);
                    ctx.body = new LoginRes(true, '登录成功！', user);
                } else {
                    ctx.body = new LoginRes(false, '用户名或密码错误！');
                }
            })(ctx, () => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            });
        }else {
            ctx.body = new LoginRes(false, '验证码错误！');
        }
    });

    /* 拦截需要登录的所有路由 */
    router.use('/platform/auth/*', (ctx: Context, next) => {
        debug('这是拦截 platform 所有路由的拦截器=====================');

        next();
    });

    platformAuth.get('/', async (ctx: Context) => {

    });

    router.use('/platform/auth', platformAuth.routes(), platformAuth.allowedMethods());
}