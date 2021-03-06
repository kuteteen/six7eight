import {Column, CreateDateColumn, Entity, getRepository, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {myDateFromat} from "../utils";
import {Site} from "./Site";
import {User} from "./User";
import {UserSite} from "./UserSite";

export enum WithdrawState {
    Wait = 'wait_withdraw',
    Success = 'success_withdraw',
    Fail = 'fail_withdraw'
}

export enum WithdrawType{
    User = 'user_withdraw',
    Site = 'site_withdraw'
}

@Entity()
export class Withdraw {
    // 提现ID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // 提现时间
    @CreateDateColumn({
        type: 'timestamp',
        transformer: {from(dVal){
                return myDateFromat(dVal);
            }, to(eVal){
                return eVal;
            }},
        readonly: true
    })
    readonly createTime!:string;

    // 提现处理时间
    @Column({
        type: 'timestamp',
        transformer: {from(dVal){
                return myDateFromat(dVal);
            }, to(eVal){
                return eVal;
            }},
        nullable: true
    })
    dealTime?: string;

    // 提现支付宝账户
    @Column({
        type: 'varchar',
        length: 100
    })
    alipayCount!: string;

    // 提现支付宝实名
    @Column({
        type: 'varchar',
        length: 100
    })
    alipayName!: string;

    // 提现金额
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    funds!: number;

    // 提现前账户金额
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    oldFunds!: number;

    // 提现后账户金额
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    newFunds!: number;

    // 提现状态
    @Column({
        type: 'enum',
        enum: WithdrawState
    })
    state: WithdrawState = WithdrawState.Wait;

    // 提现失败信息
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    failMsg?: string;

    // 提现类型(区分是用户提现还是站点提现)
    @Column({
        type: 'enum',
        enum: WithdrawType,
        readonly: true
    })
    type!: WithdrawType;

    // 用户提现账户
    @ManyToOne(type => User, user => user.withdraws)
    user?: User;

    // 站点提现账户
    @ManyToOne(type => UserSite, userSite => userSite.withdraws)
    userSite?: UserSite;

    // 提现所属分站
    @ManyToOne(type => Site, site => site.withdraws)
    site!: Site;


    private static p() {
        return getRepository(Withdraw);
    }

    private static query(name: string) {
        return Withdraw.p().createQueryBuilder(name);
    }

    async save() {
        return await Withdraw.p().save(this);
    }

    static async getWaitCount() {
        return await Withdraw.query('withdraw')
            .where('withdraw.state = :state', {state: WithdrawState.Wait})
            .getCount();
    }

    static async all(page:any) {
        return await Withdraw.query('withdraw')
            .leftJoinAndSelect('withdraw.site', 'site')
            .leftJoinAndSelect('withdraw.user', 'user')
            .leftJoinAndSelect('withdraw.userSite', 'userSite')
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .orderBy('withdraw.createTime', 'DESC')
            .getManyAndCount();
    }

    static async userAllRecords(userId: string, page:any) {
        return await Withdraw.query('withdraw')
            .innerJoin('withdraw.user', 'user', 'user.id = :userId', {userId: userId})
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .orderBy('withdraw.createTime', 'DESC')
            .getManyAndCount();
    }

    static async siteAllRecords(siteId: string, page:any) {
        return await Withdraw.query('withdraw')
            .innerJoin('withdraw.site', 'site', 'site.id = :siteId', {siteId: siteId})
            .where('withdraw.type = :type', {type: WithdrawType.Site})
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .leftJoinAndSelect('withdraw.userSite', 'userSite')
            .orderBy('withdraw.createTime', 'DESC')
            .getManyAndCount();
    }

    static async update(id: string, withdraw: Withdraw) {
        return await Withdraw.p().update(id, withdraw);
    }

    static async delById(id: string) {
        return await Withdraw.p().delete(id);
    }

    static async findByIdWithUserAndSite(id: string){
        return await Withdraw.query('withdraw')
            .where('withdraw.id = :id', {id: id})
            .leftJoinAndSelect('withdraw.site', 'site')
            .leftJoinAndSelect('withdraw.user', 'user')
            .leftJoinAndSelect('withdraw.userSite', 'userSite')
            .getOne();
    };

    static async findByIdWithUserSite(id: string) {
        return await Withdraw.p().findOne(id, {relations: ['userSite']});
    }

    static async findByIdPlain(id: string) {
        return await Withdraw.p().findOne(id);
    }

    static async platWithdrawOfDay(date: string) {
        return await Withdraw.query('withdraw')
            .select('SUM(withdraw.funds) as withdrawFunds')
            .where(`to_days(withdraw.dealTime) = to_days(:date)`, {date: date})
            .andWhere('withdraw.state = :state', {state: WithdrawState.Success})
            .getRawOne();
    }

    static async dayWithdrawOfUser(userId: string, date: string) {
        return await Withdraw.query('withdraw')
            .select('SUM(withdraw.funds) as withdraw')
            .innerJoin('withdraw.user', 'user', 'user.id = :id', {id: userId})
            .where(`to_days(withdraw.dealTime) = to_days(:date)`, {date: date})
            .andWhere('withdraw.state = :state', {state: WithdrawState.Success})
            .getRawOne();
    }
}