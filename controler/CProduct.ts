import {Product} from "../entity/Product";
import {CProductTypes} from "./CProductTypes";
import {getManager} from "typeorm";
import {ProductSite} from "../entity/ProductSite";
import {ProductType} from "../entity/ProductType";


export class CProduct {
    static async getAll() {
        return await Product.getAll();
    }

    static async setOnSale(info: any) {
        let {id, onSale} = info;
        await getManager().transaction(async tem => {
            let product = <Product>await tem.createQueryBuilder()
                .select('product')
                .from(Product, 'product')
                .leftJoinAndSelect('product.productSites', 'productSites')
                .where('product.id = :id', {id: id})
                .getOne();
            let productSites = <Array<ProductSite>>product.productSites;
            if (productSites.length > 0) {
                for(let i = 0; i < productSites.length; i++){
                    let productSite = productSites[i];
                    await tem.update(ProductSite, productSite.id, {onSale: !onSale});
                }
            }
            await tem.update(Product, product.id, {onSale: !onSale});
        });
    }

    static async delById(id: string) {
        await getManager().transaction(async tem => {
            let product = <Product>await tem.createQueryBuilder()
                .select('product')
                .from(Product, 'product')
                .leftJoinAndSelect('product.productSites', 'productSites')
                .where('product.id = :id', {id: id})
                .getOne();
            let productSites = <Array<ProductSite>>product.productSites;
            if (productSites.length > 0) {
                await tem.remove(productSites);
            }
            await tem.remove(product);
        });
    }

    static async findByNameAndTypeId(typeId: string, name: string) {
        return await Product.findByNameAndTypeId(typeId, name);
    }

    private static async editInfo(product: Product, info: any) {
        product.name = info.name;
        product.price = info.price;
        product.sitePrice = info.sitePrice;
        product.topPrice = info.topPrice;
        product.superPrice = info.superPrice;
        product.goldPrice = info.goldPrice;
        product.onSale = info.onSale;
        product.attrs = info.attrs;
        product.productType = await CProductTypes.findByName(info.productType.name);

        return await product.save();
    }

    static async add(info: any) {
        let product = new Product();
        product.name = info.name;
        product.price = info.price;
        product.sitePrice = info.sitePrice;
        product.topPrice = info.topPrice;
        product.superPrice = info.superPrice;
        product.goldPrice = info.goldPrice;
        product.onSale = info.onSale;
        product.attrs = info.attrs;
        await getManager().transaction(async tem => {
            product.productType = await tem.findOne(ProductType, info.productTypeId);
        });


        return await CProduct.editInfo(new Product(), info);
    }

    static async update(info: any) {
        return await CProduct.editInfo(<Product>await Product.findById(info.id), info);
    }
}
