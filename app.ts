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
import {Context} from "koa";

const debug = debuger('six7eight:app');

createConnection().then(async connection => {
    require('./initDataBase');

    const app = new Koa();
    const server = http.createServer(app.callback());
    const router = new Router();
    const io = socketio(server);
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
            key: 'six7eight:SESSIONID',
            maxAge: 'session'
        }, app))
        .use(views(path.resolve(__dirname, './views'), {
            extension: 'html',
            map: {
                html: 'ejs'
            }
        }))
        .use(staticDir(path.resolve(__dirname, './public')))
        .use(json());

    require("./auth");
    app.use(passport.initialize())
        .use(passport.session())
        .use(async (ctx:Context, next:any) =>{
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

    app.on('error', async (e, ctx:Context) => {
        debug(e);
    });

    io.on('connection', (socket) => {
        console.log(socket.id, ' connected server.');

        socket.on('msg', (data) => {
            console.log('socket io on msg event, data is: ' + data);
            io.emit('news', {hello: 'world'})
        });

        socket.on('disconnect', (data) => {
            console.log(data, ' 断开链接了。')
        });
    });

    server.listen(devConf.servePort);
    console.log("Koa application is up and running on port " + devConf.servePort);
}).catch(error => {
    debug(error);
});