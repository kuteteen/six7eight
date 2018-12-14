import {ProductType} from "../entity/ProductType";
import {EntityManager, getManager} from "typeorm";
import {Site} from "../entity/Site";
import {ProductTypeSite} from "../entity/ProductTypeSite";
import {WitchType} from "../entity/ProductTypeBase";
import {productToRight} from "../utils";
import {RoleUserSite, RoleUserSiteType} from "../entity/RoleUserSite";
import {RoleUserAdmin, RoleUserAdminType} from "../entity/RoleUserAdmin";


export class CProductTypes {
    static async productsRight() {
        let typeProducts = await ProductType.allWithProducts();
        return productToRight(typeProducts, []);
    }

    static async getAll() {
        return await ProductType.getAll();
    }

    static async findByName(name: string) {
        return await ProductType.findByName(name);
    }

    static async add(info: any, io: any) {
        await getManager().transaction(async tem => {
            let type = new ProductType();
            type.name = info.name;
            type.onSale = info.onSale;
            type = await tem.save(type);

            let sites = await tem.createQueryBuilder()
                .select('site')
                .from(Site, 'site')
                .getMany();
            if (sites.length > 0) {
                for(let i = 0; i < sites.length; i++){
                    let site = sites[i];
                    let typeSite = new ProductTypeSite();
                    typeSite.type = WitchType.Platform;
                    typeSite.name = type.name;
                    typeSite.onSale = type.onSale;
                    typeSite.productType = type;
                    typeSite.site = site;
                    typeSite = await tem.save(typeSite);

                    let roleUserSite = <RoleUserSite>await tem.createQueryBuilder()
                        .select('role')
                        .from(RoleUserSite, 'role')
                        .innerJoin('role.site', 'site', 'site.id = :id', {id: site.id})
                        .where('role.type = :type', {type: RoleUserSiteType.Site})
                        .getOne();
                    roleUserSite.addProductTypeToRights(typeSite.id);
                    await tem.save(roleUserSite);

                    let typeSiteMenuRight = typeSite.menuRightItem();
                    // 更新分站系统管理员页面导航栏
                    io.emit(roleUserSite.id + 'type', typeSiteMenuRight);
                    // 更新分站用户页面导航栏
                    io.emit(site.id + 'type', typeSiteMenuRight);
                    // 添加商品类别到分站商品类别管理页面
                    io.emit(site.id + 'addType', typeSite);
                }
            }

            let roleUserAdmin = <RoleUserAdmin>await tem.createQueryBuilder()
                .select('role')
                .from(RoleUserAdmin, 'role')
                .where('role.type = :type', {type: RoleUserAdminType.Developer})
                .getOne();

            roleUserAdmin.addProductTypeToRights(type.id);
            await tem.save(roleUserAdmin);

            let typeMenuRight = type.menuRightItem();
            // 更新平台系统管理员页面导航栏
            io.emit(roleUserAdmin.id + 'type', typeMenuRight);
            // 添加商品类别到平台商品类别管理页面
            io.emit('addType', type);
        });
    }

    private static async getTypeAndTypeSite(id: string, tem: EntityManager) {
        let type = <ProductType>await tem.createQueryBuilder()
            .select('type')
            .from(ProductType, 'type')
            .leftJoinAndSelect('type.productTypeSites', 'productTypeSite')
            .innerJoinAndSelect('productTypeSite.site', 'site')
            .where('type.id = :id', {id: id})
            .getOne();
        let productTypeSites = <Array<ProductTypeSite>>type.productTypeSites;
        return {type: type, productTypeSites: productTypeSites}

    }

    static async setOnSale(info: any, io:any) {
        let {id, onSale} = info;
        await getManager().transaction(async tem => {
            let {type, productTypeSites} = await CProductTypes.getTypeAndTypeSite(id, tem);
            if (productTypeSites.length > 0) {
                for(let i = 0; i < productTypeSites.length; i++){
                    let productTypeSite = productTypeSites[i];
                    productTypeSite.onSale = onSale;
                    productTypeSite = await tem.save(productTypeSite);

                    let site = <Site>productTypeSite.site;
                    io.emit(site.id + 'typeOrProductUpdate', productTypeSite.menuRightItem());
                    // 更新分站所有商品类别管理页面中对应的商品类别
                    io.emit(site.id + 'updateType', productTypeSite);
                }
            }
            type.onSale = onSale;
            type = await tem.save(type);
            io.emit('typeOrProductUpdate', type.menuRightItem());
            // 更新平台所有商品类别管理页面中对应的商品类别
            io.emit('updateType', type);
        });
    }

    static async update(info: any, io:any) {
        let {id, name, onSale} = info;
        await getManager().transaction(async tem => {
            let {type, productTypeSites} = await CProductTypes.getTypeAndTypeSite(id, tem);
            if (productTypeSites.length > 0) {
                for(let i = 0; i < productTypeSites.length; i++){
                    let productTypeSite = productTypeSites[i];
                    productTypeSite.name = name;
                    productTypeSite.onSale = onSale;
                    productTypeSite = await tem.save(productTypeSite);

                    let site = <Site>productTypeSite.site;
                    io.emit(site.id + 'typeOrProductUpdate', productTypeSite.menuRightItem());
                    // 更新分站所有商品类别管理页面中对应的商品类别
                    io.emit(site.id + 'updateType', productTypeSite);
                }
            }
            type.name = name;
            type.onSale = onSale;
            type = await tem.save(type);
            io.emit('typeOrProductUpdate', type.menuRightItem());
            // 更新平台所有商品类别管理页面中对应的商品类别
            io.emit('updateType', type);
        });
    }
}
