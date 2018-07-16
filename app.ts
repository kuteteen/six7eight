import "reflect-metadata";
import {createConnection} from "typeorm";
import * as path from "path";
import * as Koa from "koa";
import * as Router from "koa-router";
import * as bodyParser from "koa-bodyparser";
import * as logger from "koa-logger";
import * as session from "koa-session";
import * as json from "koa-json";
import * as views from "koa-views";
import * as staticDir from "koa-static";
import * as onerror from "koa-onerror";
import * as debuger from "debug";

const debug = debuger('six7eight:app');


import {appRoutes} from "./route";

createConnection().then(async connection => {
    const app = new Koa();
    const router = new Router();

    onerror(app);
    appRoutes(router);

    app.use(logger())
        .use(bodyParser())
        .use(session({
            key: 'SESSIONID'
        }, app))
        .use(views(path.resolve(__dirname, './views'), {
            extension: 'html',
            map: {
                html: 'ejs'
            }
        }))
        .use(staticDir(path.resolve(__dirname, './public')))
        .use(json())
        .use(router.routes())
        .use(router.allowedMethods());

    // app.use(async (ctx) => {
    //     if (ctx.status === 404) {
    //         await ctx.render('404');
    //     }
    // });

    app.on('error', async (err, ctx) => {
        debug(err);
    });

    app.listen(3000);
    console.log("Koa application is up and running on port 3000");
}).catch(error => {
    console.error("TypeORM connection error: " + error);
});