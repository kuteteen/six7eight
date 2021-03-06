import {RoleUserSite} from "../entity/RoleUserSite";
import {Site} from "../entity/Site";
import {getManager} from "typeorm";
import {RightSite} from "../entity/RightSite";
import {ProductTypeSite} from "../entity/ProductTypeSite";
import {getMyProducts, productToRight, siteGetMenuWaitCount, sortRights} from "../utils";
import {CProductTypeSite} from "./CProductTypeSite";

export class CRoleUserSite {

    static async save(info: any) {
        let role = new RoleUserSite();
        role.name = info.name;
        role.rights = info.rights;
        role.site = info.site;
        return await role.save();
    }

    static async allRoles(siteId:string) {
        return await RoleUserSite.getAll(siteId);
    }

    static async typeUserRoles(siteId: string) {
        return await RoleUserSite.typeUserAll(siteId);
    }

    static async findByName(name: string) {
        return await RoleUserSite.findByName(name);
    }

    static async saveOne(info:any, site: Site){
        let role = new RoleUserSite();
        role.name = info.name;
        role.editRights = info.editRights;
        role.rights = info.rights;
        role.site = site;
        let productMenus = await CProductTypeSite.productsRight(site.id);
        let {productTypes, products} = getMyProducts(role.treeRights(productMenus));
        role.productTypes = productTypes;
        role.products = products;
        return await role.save()
    }

    static async update(info: any, io: any) {
        await getManager().transaction(async tem => {
            let role = <RoleUserSite> await tem.createQueryBuilder()
                .select('role')
                .from(RoleUserSite, 'role')
                .innerJoinAndSelect('role.site', 'site')
                .where('role.id = :id', {id: info.id})
                .getOne();
            role.name = info.name;
            role.editRights = info.editRights;
            role.rights = info.rights;

            let site = role.site;
            let typeProducts = await tem.createQueryBuilder()
                .select('type')
                .from(ProductTypeSite, 'type')
                .innerJoin('type.site', 'site', 'site.id = :id', {id: site.id})
                .leftJoinAndSelect('type.productSites', 'product')
                .orderBy('type.createTime', 'DESC')
                .getMany();
            let productRights = productToRight(typeProducts, []);
            let rights = await tem.createQueryBuilder()
                .select('right')
                .from(RightSite, 'right')
                .where('right.pId = :pId', {pId: '0'})
                .leftJoinAndSelect('right.children', 'menu')
                .leftJoinAndSelect('menu.children', 'menuItem')
                .getMany();
            sortRights(rights);
            let treeRights = role.treeRights(productRights.concat(rights));
            let {productTypes, products} = getMyProducts(treeRights);
            role.productTypes = productTypes;
            role.products = products;
            await siteGetMenuWaitCount(treeRights, site.id, role.products);
            io.emit(role.id + 'changeRights', {menuRights: treeRights, rights: role.rights, roleName: role.name});
            await tem.save(role);
        });
    }

    static async delById(id: string) {
        let role = <RoleUserSite>await RoleUserSite.findByIdWithRelations(id);
        if (role.users && role.users.length > 0) {
            throw(new Error('该角色上有关联的账户，不能删除！'));
        }else{
            await RoleUserSite.delById(id);
        }
    }

}