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
const Product_1 = require("../entity/Product");
const typeorm_1 = require("typeorm");
const ProductSite_1 = require("../entity/ProductSite");
const ProductType_1 = require("../entity/ProductType");
const ProductTypeSite_1 = require("../entity/ProductTypeSite");
const ProductTypeBase_1 = require("../entity/ProductTypeBase");
const utils_1 = require("../utils");
const RoleUserSite_1 = require("../entity/RoleUserSite");
const RoleUserAdmin_1 = require("../entity/RoleUserAdmin");
class CProduct {
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Product_1.Product.getAll();
        });
    }
    static findByNameAndTypeId(typeId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Product_1.Product.findByNameAndTypeId(typeId, name);
        });
    }
    static add(info, io) {
        return __awaiter(this, void 0, void 0, function* () {
            let product = new Product_1.Product();
            product.name = info.name;
            product.price = info.price;
            product.sitePrice = info.sitePrice;
            product.topPrice = info.topPrice;
            product.superPrice = info.superPrice;
            product.goldPrice = info.goldPrice;
            product.orderTip = info.orderTip;
            product.onSale = info.onSale;
            product.minNum = info.minNum;
            product.attrs = info.attrs;
            yield typeorm_1.getManager().transaction((tem) => __awaiter(this, void 0, void 0, function* () {
                let productType = yield tem.findOne(ProductType_1.ProductType, info.productTypeId);
                product.productType = productType;
                product = yield tem.save(product);
                let productTypeSites = yield tem.createQueryBuilder()
                    .select('typeSite')
                    .from(ProductTypeSite_1.ProductTypeSite, 'typeSite')
                    .innerJoin('typeSite.productType', 'productType', 'productType.id = :id', { id: productType.id })
                    .leftJoinAndSelect('typeSite.site', 'site')
                    .getMany();
                if (productTypeSites.length > 0) {
                    for (let i = 0; i < productTypeSites.length; i++) {
                        let productTypeSite = productTypeSites[i];
                        let site = productTypeSite.site;
                        let productSite = new ProductSite_1.ProductSite();
                        productSite.type = ProductTypeBase_1.WitchType.Platform;
                        productSite.name = product.name;
                        productSite.price = product.price;
                        productSite.sitePrice = product.sitePrice;
                        productSite.topPrice = product.topPrice;
                        productSite.superPrice = product.superPrice;
                        productSite.goldPrice = product.goldPrice;
                        productSite.orderTip = product.orderTip;
                        productSite.onSale = product.onSale;
                        productSite.minNum = product.minNum;
                        productSite.attrs = product.attrs;
                        productSite.product = product;
                        productSite.site = site;
                        productSite.productTypeSite = productTypeSite;
                        productSite = yield tem.save(productSite);
                        let roleUserSite = yield tem.createQueryBuilder()
                            .select('role')
                            .from(RoleUserSite_1.RoleUserSite, 'role')
                            .innerJoin('role.site', 'site', 'site.id = :id', { id: site.id })
                            .where('role.type = :type', { type: RoleUserSite_1.RoleUserSiteType.Site })
                            .getOne();
                        roleUserSite.addProductToRights(productSite.productTypeSite.id, productSite.id);
                        yield tem.save(roleUserSite);
                        let productSiteMenuRight = productSite.menuRightItem();
                        io.emit(roleUserSite.id + 'product', { typeId: productSite.productTypeSite.id, product: productSiteMenuRight });
                        io.emit(site.id + 'product', { typeId: productSite.productTypeSite.id, product: productSiteMenuRight });
                    }
                }
                let roleUserAdmin = yield tem.createQueryBuilder()
                    .select('role')
                    .from(RoleUserAdmin_1.RoleUserAdmin, 'role')
                    .where('role.type = :type', { type: RoleUserAdmin_1.RoleUserAdminType.Developer })
                    .getOne();
                roleUserAdmin.addProductToRights(productType.id, product.id);
                yield tem.save(roleUserAdmin);
                let productMenuRight = product.menuRightItem();
                io.emit(roleUserAdmin.id + 'product', { typeId: productType.id, product: productMenuRight });
            }));
            return product;
        });
    }
    static findByIdWithProductSites(id, tem) {
        return __awaiter(this, void 0, void 0, function* () {
            let product = yield tem.createQueryBuilder()
                .select('product')
                .from(Product_1.Product, 'product')
                .leftJoinAndSelect('product.productSites', 'productSites')
                .where('product.id = :id', { id: id })
                .getOne();
            let productSites = product.productSites;
            return { product: product, productSites: productSites };
        });
    }
    static setOnSale(info, io) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, onSale } = info;
            yield typeorm_1.getManager().transaction((tem) => __awaiter(this, void 0, void 0, function* () {
                let { product, productSites } = yield CProduct.findByIdWithProductSites(id, tem);
                if (productSites.length > 0) {
                    for (let i = 0; i < productSites.length; i++) {
                        let productSite = productSites[i];
                        yield tem.update(ProductSite_1.ProductSite, productSite.id, { onSale: onSale });
                    }
                }
                yield tem.update(Product_1.Product, product.id, { onSale: onSale });
            }));
        });
    }
    static update(info, io) {
        return __awaiter(this, void 0, void 0, function* () {
            yield typeorm_1.getManager().transaction((tem) => __awaiter(this, void 0, void 0, function* () {
                let { product, productSites } = yield CProduct.findByIdWithProductSites(info.id, tem);
                let valSitePrice = utils_1.decimal(info.sitePrice).minus(product.sitePrice);
                let valTopPrice = utils_1.decimal(info.topPrice).minus(product.topPrice);
                let valSuperPrice = utils_1.decimal(info.superPrice).minus(product.superPrice);
                let valGoldPrice = utils_1.decimal(info.goldPrice).minus(product.goldPrice);
                product.name = info.name;
                product.price = info.price;
                product.sitePrice = info.sitePrice;
                product.topPrice = info.topPrice;
                product.superPrice = info.superPrice;
                product.goldPrice = info.goldPrice;
                product.orderTip = info.orderTip;
                product.onSale = info.onSale;
                product.minNum = info.minNum;
                product.attrs = info.attrs;
                yield tem.save(product);
                if (productSites.length > 0) {
                    for (let i = 0; i < productSites.length; i++) {
                        let productSite = productSites[i];
                        productSite.name = info.name;
                        productSite.orderTip = info.orderTip;
                        productSite.onSale = info.onSale;
                        productSite.minNum = info.minNum;
                        productSite.attrs = info.attrs;
                        productSite.price = info.price;
                        productSite.sitePrice = parseFloat(utils_1.decimal(productSite.sitePrice).plus(valSitePrice).toFixed(4));
                        productSite.topPrice = parseFloat(utils_1.decimal(productSite.topPrice).plus(valTopPrice).toFixed(4));
                        productSite.superPrice = parseFloat(utils_1.decimal(productSite.superPrice).plus(valSuperPrice).toFixed(4));
                        productSite.goldPrice = parseFloat(utils_1.decimal(productSite.goldPrice).plus(valGoldPrice).toFixed(4));
                        yield tem.save(productSite);
                    }
                }
            }));
        });
    }
    static delById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield typeorm_1.getManager().transaction((tem) => __awaiter(this, void 0, void 0, function* () {
                let { product, productSites } = yield CProduct.findByIdWithProductSites(id, tem);
                if (productSites.length > 0) {
                    yield tem.remove(productSites);
                }
                yield tem.remove(product);
            }));
        });
    }
}
exports.CProduct = CProduct;
//# sourceMappingURL=CProduct.js.map