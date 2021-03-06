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
const rp = require("request-promise");
const Platform_1 = require("./entity/Platform");
function sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
const feiGeUrl = 'http://47.97.62.252/api/index.php';
const feiGeToken = '1846CTZNZP3RIWQICAZ5ZCBC62XOKMNN';
function getFeiGeToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            uri: feiGeUrl,
            qs: {
                ac: 'login',
                u: 'hongtu',
                p: '123456'
            },
            json: true
        });
        return result.split('|')[1];
    });
}
function weiBoLikeFeiGe(weiBoUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            uri: feiGeUrl,
            qs: {
                ac: '1',
                url: weiBoUrl,
                num: num,
                token: feiGeToken,
            },
            json: true
        });
        if (JSON.stringify(result).includes('提交成功')) {
            let arr = JSON.stringify(result).split('|');
            return {
                code: 1000,
                msg: arr[0],
                taskid: arr[1]
            };
        }
        else {
            return {
                code: -400,
                msg: result.info
            };
        }
    });
}
const xinBangUrl = 'http://www.xinbang.ink';
function getXinBangToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            method: 'post',
            uri: xinBangUrl + '/public/agent-login',
            form: {
                username: 'hongtu44',
                password: '123456'
            }
        });
        return JSON.parse(result).token;
    });
}
function weiXinReadXinBang(url, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            method: 'post',
            uri: xinBangUrl + '/merchant-api/read',
            form: {
                article_link: url,
                read_numbers: num,
                order_type: 1,
                token: yield getXinBangToken(),
            }
        });
        return JSON.parse(result);
    });
}
function weiXinFansXinBang(weixinId, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            method: 'post',
            uri: xinBangUrl + '/merchant-api/common-focus',
            form: {
                weixin_number: weixinId,
                fans_numbers: num,
                order_type: 2,
                token: yield getXinBangToken(),
            }
        });
        return JSON.parse(result);
    });
}
function weiXinInfoXinBang(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        let timeout = 1000 * 60 * 30;
        let overtime = 0;
        let forTime = 1000 * 60;
        let count = 0;
        return yield getOrderInfoXingBang(orderId);
        function getOrderInfoXingBang(id) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    count++;
                    let result = JSON.parse(yield rp({
                        method: 'post',
                        uri: xinBangUrl + '/merchant-api/query-order',
                        form: {
                            order_sn: id,
                            token: yield getXinBangToken()
                        }
                    }));
                    if (result.code === 200) {
                        return {
                            code: 1000,
                            msg: '查询成功！',
                            startNum: result.data.start_number,
                        };
                    }
                    else {
                        throw new Error(`新榜微信阅读订单查询失败(${result.msg}),当前查询次数${count},查询时间${overtime / (1000 * 60)}分钟!`);
                    }
                }
                catch (e) {
                    if (overtime < timeout) {
                        yield sleep(forTime);
                        overtime += forTime;
                        return yield getOrderInfoXingBang(id);
                    }
                    else {
                        return {
                            code: -400,
                            msg: e.message
                        };
                    }
                }
            });
        }
    });
}
const tokenDingDian = '379e8b428727279ed3a3e89955c09c2a';
const urlDingDian = 'http://wb.dd107.com:81/taskapi';
function weiBoInfoDingDian(taskUri, taskType, weiBoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getDingDian(taskUri, taskType, weiBoUrl);
        function getDingDian(taskUri, taskType, weiBoUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let result = JSON.parse(yield rp({
                        method: 'post',
                        uri: urlDingDian + taskUri,
                        form: {
                            token: tokenDingDian,
                            type: taskType,
                            url: weiBoUrl,
                        }
                    }));
                    return result;
                }
                catch (e) {
                    return yield getDingDian(taskUri, taskType, weiBoUrl);
                }
            });
        }
    });
}
function weiBoLikeCommentForwardNumDingDian(weiBoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoInfoDingDian('/getwbinfo.do', 'sz', weiBoUrl);
    });
}
function weiBoLikeNumDingDian(weiBoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield weiBoLikeCommentForwardNumDingDian(weiBoUrl);
        if (result.code === 1000) {
            return {
                code: result.code,
                msg: result.msg,
                weiBoHttp: result.data.url,
                weiBoHttps: result.data.url.replace('http://', 'https://'),
                likeNum: result.data.zan_num,
            };
        }
        else {
            return result;
        }
    });
}
function weiBoCommentNumDingDian(weiBoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield weiBoLikeCommentForwardNumDingDian(weiBoUrl);
        if (result.code === 1000) {
            return {
                code: result.code,
                msg: result.msg,
                weiBoHttp: result.data.url,
                weiBoHttps: result.data.url.replace('http://', 'https://'),
                commentNum: result.data.pl_num,
            };
        }
        else {
            return result;
        }
    });
}
function weiBoForwardNumDingDian(weiBoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield weiBoLikeCommentForwardNumDingDian(weiBoUrl);
        if (result.code === 1000) {
            return {
                code: result.code,
                msg: result.msg,
                weiBoHttp: result.data.url,
                weiBoHttps: result.data.url.replace('http://', 'https://'),
                forwardNum: result.data.start_num,
            };
        }
        else {
            return result;
        }
    });
}
function weiBoUserInfoDingDian(weiBoUserUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (weiBoUserUrl.match(/m.weibo.cn/g)) {
            weiBoUserUrl = weiBoUserUrl.replace('m.weibo.cn', "weibo.com");
        }
        if (weiBoUserUrl.match(/weibo.cn/g)) {
            weiBoUserUrl = weiBoUserUrl.replace('weibo.cn', "weibo.com");
        }
        if (weiBoUserUrl.match(/\?/g)) {
            weiBoUserUrl = weiBoUserUrl.replace(/\?(.*)/g, "");
        }
        let result = yield weiBoInfoDingDian('/getwbuserinfo.do', 'sf', weiBoUserUrl);
        if (result.code === 1000) {
            let userUrl = Object.keys(result.data)[0];
            let info = result.data[userUrl];
            return {
                code: result.code,
                msg: result.msg,
                url: userUrl,
                name: info.name,
                uid: info.uid,
                fansNum: info.followers_count,
                focusNum: info.friends_count,
                articleNum: info.statuses_count,
                grade: info.urank,
                memberGrade: info.mbrank,
                isV: info.isv,
                accountType: info.is_a,
            };
        }
        else {
            return result;
        }
    });
}
function weiBoVoteInfoDingDian(weiBoVoteUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoInfoDingDian('/getwbvoteinfo.do', 'tp', weiBoVoteUrl);
    });
}
function weiBoTopicInfoDingDian(weiBoTopicUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoInfoDingDian('/getwbtopic.do', 'ht', weiBoTopicUrl);
    });
}
const taskUrlDingDian = 'http://wb.dd107.com:81/taskapi.do';
function weiBoFansDingDian(proid, isbf, weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            method: 'post',
            uri: taskUrlDingDian,
            headers: {
                'content-type': 'application/json'
            },
            form: {
                token: tokenDingDian,
                type: 'sf',
                addtype: 'add',
                proid: proid,
                info: JSON.stringify({
                    wbid: weiBoUserUrl,
                    allnum: num,
                    isbf: isbf
                })
            }
        });
        return JSON.parse(result);
    });
}
function weiBoFansChuJiDingDian(weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoFansDingDian(1, 2, weiBoUserUrl, num);
    });
}
function weiBoFansGaoJiDingDian(weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoFansDingDian(19, 1, weiBoUserUrl, num);
    });
}
function weiBoFansDingJiDingDian(weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoFansDingDian(7, 1, weiBoUserUrl, num);
    });
}
function weiBoFansChaoJiDingDian(weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoFansDingDian(6, 1, weiBoUserUrl, num);
    });
}
function weiBoFansDaRenDingDian(weiBoUserUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoFansDingDian(20, 1, weiBoUserUrl, num);
    });
}
function weiBoForwardDingDian(proid, weiBoUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield rp({
            method: 'post',
            uri: taskUrlDingDian,
            form: {
                token: tokenDingDian,
                type: 'zfpl',
                addtype: 'add',
                proid: proid,
                info: JSON.stringify({
                    wburl: weiBoUrl,
                    allnum: num,
                    plzftype: '0,0',
                    iscomment: 0,
                }),
                infopl: JSON.stringify({
                    countnumber: 0,
                    words_max: 0,
                    otherdata: ''
                })
            }
        });
        return JSON.parse(result);
    });
}
function weiBoForwardBoWenDingDian(weiBoUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoForwardDingDian(39, weiBoUrl, num);
    });
}
function weiBoForwardShuaLiangDingDian(weiBoUrl, num) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield weiBoForwardDingDian(3, weiBoUrl, num);
    });
}
const douYinUrl = 'https://api.douyin.qlike.cn/api.php';
function douYinVideoId(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            videoId: ''
        };
        if (douYinUrl.includes('?region')) {
            let arrHref = douYinUrl.split('?')[0].split('/');
            let videoId = arrHref[arrHref.length - 2];
            info.isOk = true;
            info.videoId = videoId;
        }
        else {
            try {
                let res = yield rp({
                    uri: douYinUrl,
                    resolveWithFullResponse: true
                });
                let href = res.request.href;
                let arrHref = href.split('?')[0].split('/');
                let videoId = arrHref[arrHref.length - 2];
                info.isOk = true;
                info.videoId = videoId;
            }
            catch (e) {
                info.msg = '地址链接错误!';
            }
        }
        return info;
    });
}
function douYinVideoInfo(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            videoId: videoId,
            userId: '',
            des: '',
            playCount: 0,
            commentCount: 0,
            diggCount: 0,
            shareCount: 0,
        };
        let result = yield rp({
            uri: douYinUrl,
            qs: {
                act: 'GetAwemeInFo',
                aweme_id: videoId
            },
            json: true
        });
        if (result.status_code === 0) {
            info.isOk = true;
            info.userId = result.aweme_detail.author_user_id;
            info.des = result.aweme_detail.desc;
            info.playCount = result.aweme_detail.statistics.play_count;
            info.commentCount = result.aweme_detail.statistics.comment_count;
            info.diggCount = result.aweme_detail.statistics.digg_count;
            info.shareCount = result.aweme_detail.statistics.share_count;
        }
        else {
            info.msg = result.status_msg;
        }
        return info;
    });
}
function douYinUserInfo(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            userId: userId,
            userPhoto: '',
            username: '',
            selfName: '',
            signature: '',
            city: '',
            school: '',
            birthday: '',
            likeNum: 0,
            focusNum: 0,
            fansNum: 0,
            loveNum: 0,
            videoNum: 0,
            homeUrl: '',
        };
        let result = yield rp({
            uri: douYinUrl,
            qs: {
                act: 'GetUserInFo',
                user_id: userId
            },
            json: true
        });
        if (result.status_code === 0) {
            info.isOk = true;
            info.userPhoto = result.user.avatar_thumb.url_list[0];
            info.username = result.user.nickname;
            info.selfName = result.user.unique_id;
            info.signature = result.user.signature;
            info.city = result.user.location;
            info.school = result.user.school_name;
            info.birthday = result.user.birthday;
            info.likeNum = result.user.total_favorited;
            info.focusNum = result.user.following_count;
            info.fansNum = result.user.follower_count;
            info.loveNum = result.user.favoriting_count;
            info.videoNum = result.user.aweme_count;
            info.homeUrl = result.user.share_info.share_url;
        }
        else {
            info.msg = result.status_msg;
        }
        return info;
    });
}
function getDouYinFansNum(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            num: 0
        };
        let idInfo = yield douYinVideoId(douYinUrl);
        if (idInfo.isOk) {
            let videoInfo = yield douYinVideoInfo(idInfo.videoId);
            if (videoInfo.isOk) {
                let userInfo = yield douYinUserInfo(videoInfo.userId);
                if (userInfo.isOk) {
                    info.isOk = true;
                    info.num = userInfo.fansNum;
                }
                else {
                    info.msg = userInfo.msg;
                }
            }
            else {
                info.msg = videoInfo.msg;
            }
        }
        else {
            info.msg = idInfo.msg;
        }
        return info;
    });
}
exports.getDouYinFansNum = getDouYinFansNum;
function getDouYinLikeNum(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            num: 0
        };
        let idInfo = yield douYinVideoId(douYinUrl);
        if (idInfo.isOk) {
            let videoInfo = yield douYinVideoInfo(idInfo.videoId);
            if (videoInfo.isOk) {
                info.isOk = true;
                info.num = videoInfo.diggCount;
            }
            else {
                info.msg = videoInfo.msg;
            }
        }
        else {
            info.msg = idInfo.msg;
        }
        return info;
    });
}
exports.getDouYinLikeNum = getDouYinLikeNum;
function getDouYinCommentNum(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            num: 0
        };
        let idInfo = yield douYinVideoId(douYinUrl);
        if (idInfo.isOk) {
            let videoInfo = yield douYinVideoInfo(idInfo.videoId);
            if (videoInfo.isOk) {
                info.isOk = true;
                info.num = videoInfo.commentCount;
            }
            else {
                info.msg = videoInfo.msg;
            }
        }
        else {
            info.msg = idInfo.msg;
        }
        return info;
    });
}
exports.getDouYinCommentNum = getDouYinCommentNum;
function getDouYinForwardNum(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            num: 0
        };
        let idInfo = yield douYinVideoId(douYinUrl);
        if (idInfo.isOk) {
            let videoInfo = yield douYinVideoInfo(idInfo.videoId);
            if (videoInfo.isOk) {
                info.isOk = true;
                info.num = videoInfo.shareCount;
            }
            else {
                info.msg = videoInfo.msg;
            }
        }
        else {
            info.msg = idInfo.msg;
        }
        return info;
    });
}
exports.getDouYinForwardNum = getDouYinForwardNum;
function getDouYinPlayNum(douYinUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = {
            isOk: false,
            msg: '',
            num: 0
        };
        let idInfo = yield douYinVideoId(douYinUrl);
        if (idInfo.isOk) {
            let videoInfo = yield douYinVideoInfo(idInfo.videoId);
            if (videoInfo.isOk) {
                info.isOk = true;
                info.num = videoInfo.playCount;
            }
            else {
                info.msg = videoInfo.msg;
            }
        }
        else {
            info.msg = idInfo.msg;
        }
        return info;
    });
}
exports.getDouYinPlayNum = getDouYinPlayNum;
function autoPutOrderToOther(order) {
    return __awaiter(this, void 0, void 0, function* () {
        let platform = yield Platform_1.Platform.find();
        let orderName = order.name;
        let submitResult = {
            isOk: false,
            msg: '',
            startNum: 0
        };
        if (orderName.includes('微信公众号业务')) {
            if (platform.weiXinReadXinBang && orderName.includes('微信文章阅读')) {
                let result = yield weiXinReadXinBang(order.fields.addressLianjie.value, order.num);
                if (result.code === 200) {
                    let info = yield weiXinInfoXinBang(result.order_sn);
                    if (info.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到新榜微信普通阅读,订单号: ' + result.order_sn;
                        submitResult.startNum = info.startNum;
                    }
                    else {
                        submitResult.msg = info.msg;
                    }
                }
            }
            else if (platform.weiXinFansXinBang && orderName.includes('公众号粉丝')) {
                let result = yield weiXinFansXinBang(order.fields.acountWeixin.value, order.num);
                if (result.code === 200) {
                    submitResult.isOk = true;
                    submitResult.msg = '提交到新榜公众号普通关注,订单号: ' + result.order_sn;
                }
                else {
                    submitResult.msg = result.msg;
                }
            }
        }
        else if (orderName.includes('微博业务')) {
            if (platform.weiBoFansPrimaryDingDian && orderName.includes('初级粉丝')) {
                let info = yield weiBoUserInfoDingDian(order.fields.addressLianjie.value);
                if (info.code === 1000) {
                    let result = yield weiBoFansChuJiDingDian(info.url, order.num);
                    if (result.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到顶点微博初级粉丝,订单号: ' + result.data.taskid;
                        submitResult.startNum = info.fansNum;
                    }
                    else {
                        submitResult.msg = result.msg;
                    }
                }
                else {
                    submitResult.msg = info.msg;
                }
            }
            else if (platform.weiBoFansSuperDingDian && orderName.includes('高级粉丝')) {
                let info = yield weiBoUserInfoDingDian(order.fields.addressLianjie.value);
                if (info.code === 1000) {
                    let result = yield weiBoFansGaoJiDingDian(info.url, order.num);
                    if (result.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到顶点微博高级粉丝,订单号: ' + result.data.taskid;
                        submitResult.startNum = info.fansNum;
                    }
                    else {
                        submitResult.msg = result.msg;
                    }
                }
                else {
                    submitResult.msg = info.msg;
                }
            }
            else if (platform.weiBoFansTopDingDian && (orderName.includes('顶级粉丝') || orderName.includes('超级粉丝'))) {
                let info = yield weiBoUserInfoDingDian(order.fields.addressLianjie.value);
                if (info.code === 1000) {
                    let result = yield weiBoFansDingJiDingDian(info.url, order.num);
                    if (result.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到顶点微博顶级粉丝,订单号: ' + result.data.taskid;
                        submitResult.startNum = info.fansNum;
                    }
                    else {
                        submitResult.msg = result.msg;
                    }
                }
                else {
                    submitResult.msg = info.msg;
                }
            }
            else if (platform.weiBoFansDaRenDingDian && orderName.includes('达人粉丝')) {
                let info = yield weiBoUserInfoDingDian(order.fields.addressLianjie.value);
                if (info.code === 1000) {
                    let result = yield weiBoFansDaRenDingDian(info.url, order.num);
                    if (result.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到顶点微博达人粉丝20%,订单号: ' + result.data.taskid;
                        submitResult.startNum = info.fansNum;
                    }
                    else {
                        submitResult.msg = result.msg;
                    }
                }
                else {
                    submitResult.msg = info.msg;
                }
            }
            else if (platform.weiBoForwardDingDian && orderName.includes('微博转评')) {
                let result = yield weiBoForwardBoWenDingDian(order.fields.addressLianjie.value, order.num);
                if (result.code === 1000) {
                    submitResult.isOk = true;
                    submitResult.msg = '提交到顶点微博转评,订单号: ' + result.data.taskid;
                    submitResult.startNum = result.data.position_start;
                }
                else {
                    submitResult.msg = result.msg;
                }
            }
            else if (platform.weiBoShuaLiangForwardDingDian && orderName.includes('刷量转发')) {
                let result = yield weiBoForwardShuaLiangDingDian(order.fields.addressLianjie.value, order.num);
                if (result.code === 1000) {
                    submitResult.isOk = true;
                    submitResult.msg = '提交到顶点微博刷量转发,订单号: ' + result.data.taskid;
                    submitResult.startNum = result.data.position_start;
                }
                else {
                    submitResult.msg = result.msg;
                }
            }
            else if (platform.weiBoLikeFeiGe && (orderName.includes('高级赞') || orderName.includes('初级赞'))) {
                let info = yield weiBoLikeNumDingDian(order.fields.addressLianjie.value);
                if (info.code === 1000) {
                    let result = yield weiBoLikeFeiGe(info.weiBoHttps, order.num);
                    if (result.code === 1000) {
                        submitResult.isOk = true;
                        submitResult.msg = '提交到飞鸽微博点赞,订单号: ' + result.taskid;
                        submitResult.startNum = info.likeNum;
                    }
                    else {
                        submitResult.msg = result.msg;
                    }
                }
                else {
                    submitResult.msg = info.msg;
                }
            }
        }
        return submitResult;
    });
}
exports.autoPutOrderToOther = autoPutOrderToOther;
;
//# sourceMappingURL=request-other.js.map