import {OrderStatus, OrderUser} from "../entity/OrderUser";
import {EntityManager, getManager} from "typeorm";
import {ProductSite} from "../entity/ProductSite";
import {ProductTypeSite} from "../entity/ProductTypeSite";
import {FundsRecordUser} from "../entity/FundsRecordUser";
import {assert, decimal, now} from "../utils";
import {ErrorOrderUser} from "../entity/ErrorOrderUser";
import {WitchType} from "../entity/ProductTypeBase";
import {Product} from "../entity/Product";
import {ProductType} from "../entity/ProductType";
import {FundsRecordType, FundsUpDown} from "../entity/FundsRecordBase";
import {User} from "../entity/User";
import {Site} from "../entity/Site";


export class COrderUser {
    static async getWaitAndBackoutCount(productId: string) {
        return await OrderUser.getWaitAndBackoutCount(productId);
    }

    static async getSiteWaitAndBackoutCount(productId: string) {
        return await OrderUser.getSiteWaitAndBackoutCount(productId);
    }

    static async findUserOrdersByProductId(productId: string, userId: string) {
        return await OrderUser.findUserOrdersByProductId(productId, userId);
    }

    static async findPlatformOrdersByProductId(productId: string) {
        return await OrderUser.findPlatformOrdersByProductId(productId);
    }

    static async findSiteOrdersByProductId(productId: string, siteId: string) {
        return await OrderUser.findSiteOrdersByProductId(productId, siteId);
    }

    private static async countOrderProfits(tem: EntityManager, site: Site, user: User, product: ProductSite, num: number, profits: Array<any>) {
        let userNow = <User>await tem.createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.id = :id', {id: user.id})
            .innerJoinAndSelect('user.parent', 'parent')
            .leftJoinAndSelect('parent.role', 'parentRole')
            .getOne();
        if (userNow) {
            let parent = <User>userNow.parent;
            if (parent.role.type !== user.role.type) {
                let profitPrice = decimal(product.getPriceByUserRole(user.role)).minus(product.getPriceByUserRole(parent.role));
                profits.push({
                    type: 'user',
                    id: parent.id,
                    name: parent.username,
                    profit: parseFloat(decimal(profitPrice).times(num).toFixed(4))
                });
            }
            await COrderUser.countOrderProfits(tem, site, parent, product, num, profits);
        } else {
            if (product.type === WitchType.Platform) {
                let profitPriceSite = decimal(product.topPrice).minus(product.sitePrice);
                profits.push({
                    type: 'site',
                    id: site.id,
                    name: site.name,
                    profit: parseFloat(decimal(profitPriceSite).times(num).toFixed(4))
                });
                let profitPricePlatform = decimal(product.getPriceByUserRole(user.role)).minus(<number>product.price).minus(profitPriceSite);
                profits.push({
                    type: 'platform',
                    id: null,
                    name: '平台',
                    profit: parseFloat(decimal(profitPricePlatform).times(num).toFixed(4))
                });
            }else{
                let profitPriceSite = decimal(product.getPriceByUserRole(user.role)).minus(product.sitePrice);
                profits.push({
                    type: 'site',
                    id: site.id,
                    name: site.name,
                    profit: parseFloat(decimal(profitPriceSite).times(num).toFixed(4))
                });
            }
        }
    }

    static async add(info: any, user:User, io: any) {
        let order = new OrderUser();
        await getManager().transaction(async tem => {
            let productSite = <ProductSite> await tem.createQueryBuilder()
                .select('productSite')
                .from(ProductSite, 'productSite')
                .where('productSite.id = :id', {id: info.productId})
                .leftJoinAndSelect('productSite.product', 'product')
                .leftJoinAndSelect('productSite.productTypeSite', 'productTypeSite')
                .leftJoinAndSelect('productTypeSite.productType', 'productType')
                .getOne();
            let productTypeSite = <ProductTypeSite>productSite.productTypeSite;
            let product = <Product>productSite.product;
            let productType = <ProductType>productSite.productTypeSite.productType;

            order.name = productTypeSite.name + ' / ' + productSite.name;
            order.type = productSite.type;
            order.speed = productSite.speed;
            order.num = info.num;
            order.price = productSite.getPriceByUserRole(user.role);
            order.totalPrice = parseFloat(decimal(order.price).times(order.num).toFixed(4));
            assert(user.funds >= order.totalPrice, '账户余额不足，请充值！');
            order.fields = {};
            for(let i = 0; i < productSite.attrs.length; i++){
                let item = productSite.attrs[i];
                order.fields[item.type] = {name: item.name, value: info[item.type]};
            }
            await COrderUser.countOrderProfits(tem, user.site, user, productSite, order.num, order.profits = []);
            if (order.type === WitchType.Platform) {
                order.basePrice = parseFloat(decimal(productSite.price).times(order.num).toFixed(4));
            }else{
                order.basePrice = parseFloat(decimal(productSite.sitePrice).times(order.num).toFixed(4));
            }
            order.user = user;
            order.site = user.site;
            order.productSite = productSite;
            order.productTypeSite = productTypeSite;
            order.productType = productType;
            order.product = product;
            order = await tem.save(order);

            let userOldFunds = user.funds;
            user.funds = parseFloat(decimal(userOldFunds).minus(order.totalPrice).toFixed(4));
            user.freezeFunds = parseFloat(decimal(user.freezeFunds).plus(order.totalPrice).toFixed(4));
            await tem.save(user);

            let consume = new FundsRecordUser();
            consume.oldFunds = userOldFunds;
            consume.funds = order.totalPrice;
            consume.newFunds = user.funds;
            consume.upOrDown = FundsUpDown.Minus;
            consume.type = FundsRecordType.Order;
            consume.description = productTypeSite.name + ' / ' + productSite.name + ', 单价： ￥' + order.price + ', 下单数量： ' + order.num;
            consume.user = user;
            await tem.save(consume);

            // io发送订单到后台订单管理页面
            if (order.type === WitchType.Site) {
                io.emit(user.site.id + 'plusBadge', productSite.id);
                io.emit(user.site.id + 'addOrder', {productId: productSite.id, order: order});
            } else {
                io.emit('plusBadge', product.id);
                io.emit('addOrder', {productId: product.id, order: order});
            }
        });
        return order;
    }

    private static async getOrderInfo(tem: EntityManager, orderId: string) {
        return await tem.createQueryBuilder()
            .select('order')
            .from(OrderUser, 'order')
            .where('order.id = :id', {id: orderId})
            .leftJoinAndSelect('order.site', 'site')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .leftJoinAndSelect('order.productSite', 'productSite')
            .getOne();
    }

    static async execute(info: any, io: any) {
        await getManager().transaction(async tem => {
            let order = <OrderUser>await COrderUser.getOrderInfo(tem, info.id);
            if (order.status === OrderStatus.Wait) {
                order.status = OrderStatus.Execute;
                order.startNum = info.startNum;
                order.dealTime = now();
                order = await tem.save(order);
                if (order.type === WitchType.Platform) {
                    io.emit('minusBadge', order.product!.id);
                    io.emit('executeOrder', {productId: order.product!.id, order: order})
                }else{
                    io.emit(order.site.id + 'minusBadge', order.productSite.id);
                    io.emit(order.site.id + 'executeOrder', {productId: order.productSite.id, order: order})
                }
                io.emit(order.productSite.id + 'executeOrder', order)
            }
        });
    }

    static async refund(info: any, io: any) {
        await getManager().transaction(async tem => {
            // 查询出订单信息
            let order = <OrderUser>await COrderUser.getOrderInfo(tem, info.id);
            assert(order.status !== OrderStatus.Finish, '订单已经执行结束，不能撤销');
            order.executeNum = info.executeNum;
            order.refundMsg = info.refundMsg;
            let site = <Site>order.site;
            let user = <User>order.user;
            let product = <Product>order.product;
            let productSite = <ProductSite>order.productSite;

            if (order.executeNum < 1) {
                // 如果订单执行量为0， 则直接退款，设置订单状态为结束

            }else{
                // 如果订单执行量大于0， 则计算执行比例，按比例结算返利(返利时更新返利金额)和退款，设置订单状态为结束

            }
        });
    }

    private static async orderRefundTatio(tem: EntityManager, ratio: number, order: OrderUser, user: User) {
        let refundFunds = parseFloat(decimal(order.totalPrice).times(ratio).toFixed(4));

        let userOldFunds = user.funds;
        user.funds = parseFloat(decimal(userOldFunds).plus(refundFunds).toFixed(4));
        user.freezeFunds = parseFloat(decimal(user.freezeFunds).minus(refundFunds).toFixed(4));
        user = await tem.save(user);

        let consume = new FundsRecordUser();
        consume.oldFunds = userOldFunds;
        consume.funds = refundFunds;
        consume.newFunds = user.funds;
        consume.upOrDown = FundsUpDown.Plus;
        consume.type = FundsRecordType.Order;
        consume.description = order.name + ',撤销订单。 单价： ￥' + order.price + ', 下单数量： ' + order.num + ', 执行数量： 0';
        consume.user = user;
        await tem.save(consume);
    }

    // 用户申请撤单
    static async applyRefund(info: any, io: any) {
        return await getManager().transaction(async tem => {
            let order = <OrderUser>await COrderUser.getOrderInfo(tem, info.id);
            assert(order.status !== OrderStatus.Finish, '当前订单已经执行完毕，不能撤销');
            let site = <Site>order.site;
            let user = <User>order.user;
            let product = <Product>order.product;
            let productSite = <ProductSite>order.productSite;

            if (order.status === OrderStatus.Wait) {
                await COrderUser.orderRefundTatio(tem, 1, order, user);

                order.executeNum = 0;
                order.status = OrderStatus.Finish;
                order.refundMsg = '未开始执行，用户撤销。';
                order.finishTime = now();
                order.user = user;
                order = await tem.save(order);

                // io发送订单到后台订单管理页面
                if (order.type === WitchType.Site) {
                    io.emit(site.id + 'refundOrder', {productId: productSite.id, order: order});
                    io.emit(site.id + 'minusBadge', productSite.id);
                } else {
                    io.emit('refundOrder', {productId: product.id, order: order});
                    io.emit('minusBadge', product.id);
                }
                return order;
            } else {
                order.status = OrderStatus.Refund;
                order = await tem.save(order);

                let error = new ErrorOrderUser();
                error.type = order.type;
                error.content = '申请撤销订单';
                error.order = order;
                error.site = site;
                error = await tem.save(error);

                // 发送订单报错到后台页面
                if (error.type === WitchType.Site) {
                    io.emit(site.id + 'plusBadge', 'orderErrorSite');
                    io.emit(site.id + 'addOrderError', error);
                } else {
                    io.emit('plusBadge', 'orderErrorPlatform');
                    io.emit('addOrderError', error);
                }
                return order;
            }
        });
    }

    static async addError(info: any, io: any) {
        let {orderId, content} = info;
        let order = <OrderUser>await OrderUser.findByIdWithSite(orderId);
        let error = new ErrorOrderUser();
        error.type = order.type;
        error.content = content;
        error.order = order;
        error.site = order.site;
        error = await error.save();

        // 发送订单报错到后台页面
        if (error.type === WitchType.Site) {
            io.emit(error.site.id + 'plusBadge', 'orderErrorSite');
            io.emit(error.site.id + 'addOrderError', error);
        } else {
            io.emit('plusBadge', 'orderErrorPlatform');
            io.emit('addOrderError', error);
        }
    }

    static async getErrors(orderId: string) {
        return await ErrorOrderUser.allByOrderId(orderId);
    }

    static async seeErrors(orderId: string) {
        await OrderUser.update(orderId, {newErrorDeal: false});
    }
}
