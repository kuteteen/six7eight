import {FeedbackBase} from "./FeedbackBase";
import {Entity, getRepository, ManyToOne} from "typeorm";
import {Site} from "./Site";
import {UserSite} from "./UserSite";
import {UserAdmin} from "./UserAdmin";

@Entity()
export class FeedbackUserSite extends FeedbackBase{
    // 所属分站
    @ManyToOne(type => Site, site => site.feedbacksUserSite)
    site!: Site;

    // 反馈账户
    @ManyToOne(type => UserSite, userSite => userSite.feedbacks)
    user!: UserSite;

    // 反馈处理账户
    @ManyToOne(type => UserAdmin, userAdmin => userAdmin.dealFeedbacks)
    dealUser?: UserAdmin;


    private static p() {
        return getRepository(FeedbackUserSite);
    }

    async save() {
        return await FeedbackUserSite.p().save(this);
    }

    private static query(name: string) {
        return FeedbackUserSite.p().createQueryBuilder(name);
    }

    static async getWaitCount() {
        return await FeedbackUserSite.query('feedback')
            .where('feedback.isDeal = :isDeal', {isDeal: false})
            .getCount();
    }

    static async getAll(page:any) {
        return await FeedbackUserSite.query('feedback')
            .leftJoinAndSelect('feedback.site', 'site')
            .leftJoinAndSelect('feedback.user', 'user')
            .leftJoinAndSelect('feedback.dealUser', 'dealUser')
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .orderBy('feedback.createTime', 'DESC')
            .getManyAndCount();
    }

    static async getSiteAll(siteId: string, page:any) {
        return await FeedbackUserSite.query('feedback')
            .innerJoin('feedback.site', 'site', 'site.id = :siteId', {siteId: siteId})
            .leftJoinAndSelect('feedback.user', 'user')
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .orderBy('feedback.createTime', 'DESC')
            .getManyAndCount();
    }

    static async update(id: string, feedback:FeedbackUserSite) {
        return await FeedbackUserSite.p().update(id, feedback);
    }

    static async delById(id: string) {
        return await FeedbackUserSite.p().delete(id);
    }

    static async findById(id: string){
        return await FeedbackUserSite.p().findOne(id, {relations: ['user']});
    };
}