import {FeedbackUser} from "../entity/FeedbackUser";
import {MessageTitle} from "../entity/MessageBase";
import {MessageUser} from "../entity/MessageUser";
import {assert} from "../utils";

export class CFeedbackUser {

    static async getWaitCount() {
        return await FeedbackUser.getWaitCount();
    }

    static async getSiteWaitCount(siteId: string) {
        return await FeedbackUser.getSiteWaitCount(siteId);
    }

    static async getAll(page:any) {
        return await FeedbackUser.getAll(page);
    }

    static async siteGetAll(siteId:string, page:any) {
        return await FeedbackUser.siteGetAll(siteId, page);
    }

    static async userGetAll(userId:string, page:any) {
        return await FeedbackUser.userGetAll(userId, page);
    }

    static async findById(id: string) {
        return await FeedbackUser.findByIdPlain(id);
    }

    static async add(info: any, io: any) {
        let feedback = new FeedbackUser();
        feedback.content = info.content;
        feedback.user = info.user;
        feedback.site = info.site;
        feedback = await feedback.save();
        // 将问题反馈发送到后台问题反馈页面
        io.emit(info.site.id + 'plusBadge', 'feedbackUserSite');
        io.emit('plusBadge', 'feedbackUserPlatform');
        io.emit(feedback.site.id + 'addFeedback', feedback);
        io.emit('addFeedback', feedback);
        return feedback;
    }

    static async update(info: any) {
        let feedback = <FeedbackUser>await FeedbackUser.findById(info.id);
        feedback.content = info.content;
        return await feedback.save();
    }

    static async deal(info: any, io:any) {
        let feedback = <FeedbackUser>await FeedbackUser.findById(info.feedback.id);
        assert(!feedback.isDeal, '该条反馈已经处理了');
        feedback.isDeal = true;
        feedback.dealContent = info.dealContent;
        feedback.dealUserAdmin = info.dealUserAdmin;
        feedback.dealUserSite = info.dealUserSite;
        feedback.dealTime = info.dealTime;
        feedback = await feedback.save();
        io.emit(feedback.site.id + 'minusBadge', 'feedbackUserSite');
        io.emit('minusBadge', 'feedbackUserPlatform');
        io.emit(feedback.site.id + 'dealFeedback', feedback);
        io.emit('dealFeedback', feedback);

        let message = new MessageUser();
        message.user = feedback.user;
        message.title = MessageTitle.Feedback;
        message.content = <string>feedback.dealContent;
        message.frontUrl = '/feedback/records';
        message.aimId = feedback.id;
        await message.save();
        // 发送消息提示到用户
        io.emit(feedback.user.id + 'plusMessageNum');
    }
}
