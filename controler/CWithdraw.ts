import {Withdraw, WithdrawState, WithdrawType} from "../entity/Withdraw";
import {decimal, now} from "../utils";
import {User} from "../entity/User";
import {UserSite} from "../entity/UserSite";
import {Site} from "../entity/Site";
import {getManager} from "typeorm";

export class CWithdraw {

    static async add(info: {alipayCount:string, alipayName:string, funds:number, type:WithdrawType, user?:User, userSite?:UserSite, site:Site}) {
        let {alipayCount, alipayName, funds, type, user, userSite, site} = info;
        let withdraw = new Withdraw();
        withdraw.alipayCount = alipayCount;
        withdraw.alipayName = alipayName;
        withdraw.funds = funds;
        withdraw.type = type;
        withdraw.user = user;
        withdraw.userSite = userSite;
        withdraw.site = site;
        await getManager().transaction(async tem => {
            if (type === WithdrawType.User) {
                withdraw.oldFunds = user!.funds;
                withdraw.newFunds = parseFloat(decimal(withdraw.oldFunds).minus(funds).toFixed(4));
                await tem.update(User, user!.id, {
                    funds: withdraw.newFunds,
                    freezeFunds: parseFloat(decimal(user!.freezeFunds).plus(funds).toFixed(4))
                });
            }else if (type === WithdrawType.Site) {
                withdraw.oldFunds = site.funds;
                withdraw.newFunds = parseFloat(decimal(withdraw.oldFunds).minus(funds).toFixed(4));
                await tem.update(Site, site.id, {
                    funds:  withdraw.newFunds,
                    freezeFunds: parseFloat(decimal(site.freezeFunds).plus(funds).toFixed(4))
                })
            }
            await tem.save(withdraw);
        });
    }

    static async userAll(userId: string) {
        return await Withdraw.userAllRecords(userId);
    }

    static async siteAll(siteId: string) {
        return await Withdraw.siteAllRecords(siteId);
    }

    static async all() {
        return await Withdraw.all();
    }

    static async handWithdraw(withdrawId: string) {
        let withdraw = <Withdraw>await Withdraw.findByIdWithUserAndSite(withdrawId);
        withdraw.dealTime = now();
        withdraw.state = WithdrawState.Success;
        await getManager().transaction(async tem => {
            let type = withdraw.type;
            if (type === WithdrawType.User) {
                let user = <User>withdraw.user;
                await tem.update(User, user.id, {
                    freezeFunds: parseFloat(decimal(user.freezeFunds).minus(withdraw.funds).toFixed(4))
                });
            }else if (type === WithdrawType.Site) {
                let site = <Site>withdraw.site;
                await tem.update(Site, site.id, {
                    freezeFunds: parseFloat(decimal(site.freezeFunds).minus(withdraw.funds).toFixed(4))
                })
            }
            withdraw = await tem.save(withdraw);
        });
        return withdraw;
    }

}