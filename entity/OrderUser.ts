import {
    Column,
    CreateDateColumn,
    Entity, getRepository, getTreeRepository,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {myDateFromat} from "../utils";
import {Site} from "./Site";
import {User} from "./User";
import {Product} from "./Product";
import {ProductSite} from "./ProductSite";
import {ProductType} from "./ProductType";
import {ProductTypeSite} from "./ProductTypeSite";
import {WitchType} from "./ProductTypeBase";
import {ErrorOrderUser} from "./ErrorOrderUser";

export enum OrderStatus {
    Wait = '待执行',
    Execute = '执行中',
    Refund = '待撤销',
    Refunded = '已撤销',
}

@Entity()
export class OrderUser {
    // 订单ID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // 订单名称（商品类别 / 商品名称）
    @Column()
    name!: string;

    // 订单创建时间
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

    // 订单开始执行时间,即订单处理时间
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

    // 订单结束执行时间,即订单退款时间
    @Column({
        type: 'timestamp',
        transformer: {from(dVal){
                return myDateFromat(dVal);
            }, to(eVal){
                return eVal;
            }},
        nullable:true
    })
    finishTime?: string;

    // 类型（区分平台产品订单还是分站自己的产品订单）
    @Column({
        type: "enum",
        enum: WitchType
    })
    type!: WitchType;

    // 订单执行速度（每分钟执行个数）
    @Column()
    speed!: number;

    // 订单数量
    @Column()
    num!: number;

    // 订单单价
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    price!: number;

    // 订单总价
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    totalPrice!: number;

    // 订单其余字段
    @Column('simple-json')
    fields!: any;

    // 订单返利信息
    @Column('simple-json')
    profits!: any;

    // 订单成本
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4
    })
    basePrice!: number;

    // 订单执行初始量
    @Column({
        nullable: true
    })
    startNum?: number;

    // 订单已执行数量
    @Column()
    executeNum: number = 0;

    // 订单退单信息
    @Column({
        type: 'varchar',
        length: 120,
        nullable: true
    })
    refundMsg?: string;

    // 订单状态
    @Column({
        type: "enum",
        enum: OrderStatus
    })
    status: OrderStatus = OrderStatus.Wait;

    // 是否有被处理的新的报错信息(后台处理报错信息时，设置未true；前端下单用户查看报错内容时，这是为false)
    @Column()
    newErrorDeal: boolean = false;

    // 订单报错信息
    @OneToMany(type => ErrorOrderUser, errorOrderUser => errorOrderUser.order)
    errors?: ErrorOrderUser[];

    // 订单所属分站
    @ManyToOne(type => Site, site => site.ordersUser)
    site!: Site;

    // 订单所属账户
    @ManyToOne(type => User, user => user.orders)
    user!: User;

    // 订单所属平台产品类别
    @ManyToOne(type => ProductType, productType => productType.orders)
    productType?: ProductType;

    // 订单所属平台产品
    @ManyToOne(type => Product, product => product.orders)
    product?: Product;

    // 订单所属分站产品类别
    @ManyToOne(type => ProductTypeSite, productTypeSite => productTypeSite.orders)
    productTypeSite!: ProductTypeSite;

    // 订单所属分站产品
    @ManyToOne(type => ProductSite, productSite => productSite.orders)
    productSite!: ProductSite;



    private static p() {
        return getRepository(OrderUser);
    }

    async save() {
        return await OrderUser.p().save(this);
    }

    private static query(name: string) {
        return OrderUser.p().createQueryBuilder(name);
    }

    static async update(id: string, order:any) {
        return await OrderUser.p().update(id, order);
    }

    static async findByIdWithSite(id: string){
        return await OrderUser.query('order')
            .where('order.id = :id', {id: id})
            .innerJoinAndSelect('order.site', 'site')
            .getOne();
    };

    static async findUserOrdersByProductId(productId: string, userId: string) {
        return await OrderUser.query('order')
            .innerJoin('order.productSite', 'productSite', 'productSite.id = :productId', {productId: productId})
            .innerJoin('order.user', 'user', 'user.id = :userId', {userId: userId})
            .addOrderBy('order.createTime', 'DESC')
            .getMany();
    }

    static async findPlatformOrdersByProductId(productId: string, page:any) {
        return await OrderUser.query('order')
            .innerJoin('order.product', 'product', 'product.id = :id', {id: productId})
            .skip((page.currentPage - 1) * page.pageSize)
            .take(page.pageSize)
            .addOrderBy('order.createTime', 'DESC')
            .getManyAndCount();
    }

    static async findSiteOrdersByProductId(productId: string, siteId: string) {
        return await OrderUser.query('order')
            .innerJoin('order.productSite', 'productSite', 'productSite.id = :productId', {productId: productId})
            .innerJoin('order.site', 'site', 'site.id = :siteId', {siteId: siteId})
            .addOrderBy('order.createTime', 'DESC')
            .getMany();
    }

    static async getWaitAndBackoutCount(productId: string) {
        return await OrderUser.query('order')
            .innerJoin('order.product', 'product', 'product.id = :id', {id: productId})
            .where('order.status = :status', {status: OrderStatus.Wait})
            .orWhere('order.status = :orStatus', {orStatus: OrderStatus.Refund})
            .getCount()
    }

    static async getSiteWaitAndBackoutCount(productId: string) {
        return await OrderUser.query('order')
            .innerJoin('order.productSite', 'productSite', 'productSite.id = :id', {id: productId})
            .where('order.product IS NULL')
            .andWhere('order.status = :status', {status: OrderStatus.Wait})
            .orWhere('order.status = :orStatus', {orStatus: OrderStatus.Refund})
            .getCount();
    }
}