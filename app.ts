///<reference path="node_modules/@types/node/index.d.ts"/>
import "reflect-metadata";
import {createConnection} from "typeorm";
import path = require("path");
import socketio = require("socket.io");
import Koa = require("koa");
import http = require('http');
import Router  = require("koa-router");
import bodyParser = require("koa-bodyparser");
import logger = require("koa-logger");
import session = require("koa-session");
import json = require("koa-json");
import views = require("koa-views");
import staticDir = require("koa-static");
import onerror = require("koa-onerror");
import passport= require("koa-passport");
import cors = require("koa2-cors");
import debuger = require("debug");
import {appRoutes} from "./route";
import {devConf} from "./config";
import {MsgRes} from "./utils";
import {COrderUser} from "./controler/COrderUser";
import ueditor = require("koa2-ueditor");


const debug = debuger('six7eight:app');

createConnection().then(async connection => {
    require('./initDataBase');

    const app = new Koa();
    const server = http.createServer(app.callback());
    const io = socketio(server);
    (app.context as any).io = io;
    COrderUser.orderAutoAccount(io);

    const router = new Router();
    router.all('/editor/controller', ueditor());
    appRoutes(router);

    onerror(app);
    app.keys = ['six7eight'];

    app.use(logger())
        .use(bodyParser())
        .use(cors({
            origin: devConf.clientHost + ':' + devConf.clientPort,
            credentials: true
        }))
        .use(session({
            key: 'six7eight:SESSIONID'
        }, app))
        .use(views(path.resolve(__dirname, './views'), {
            extension: 'html',
            map: {
                html: 'ejs'
            }
        }))
        .use(staticDir(path.resolve(__dirname, './public'), {
            maxage: 1000 * 60 * 60 * 24 * 900,
        }))
        .use(json());

    require("./auth");
    app.use(passport.initialize())
        .use(passport.session())
        .use(async (ctx, next) =>{
            try{
                await next();
            }catch (e) {
                switch (e.code) {
                    case 'ER_DUP_ENTRY':
                        ctx.body =  new MsgRes(false, '数据已经存在：' + e.message + '！');
                        break;
                    default:
                        ctx.body = new MsgRes(false, '操作失败：' + e.message + '!');
                }
                debug(e);
            }
        })
        .use(router.routes())
        .use(router.allowedMethods());

    app.use(async (ctx) => {
        if (ctx.status === 404) {
            await ctx.render('404');
        }
    });

    app.on('error', async (e) => {
        debug(e);
    });

    io.on('connection', (socket) => {

        socket.on('disconnect', () => {

        });
    });

    server.listen(devConf.servePort);
    console.log("Koa application is up and running on port " + devConf.servePort);
}).catch(error => {
    debug(error);
});