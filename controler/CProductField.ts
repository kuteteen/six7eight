import {ProductTypeSite} from "../entity/ProductTypeSite";
import {ProductSite} from "../entity/ProductSite";
import {ProductField} from "../entity/ProductField";


export class CProductField {
    static async getAll() {
        return await ProductField.getAll();
    }

    static async findByName(name: string) {
        return await ProductField.findByName(name);
    }

    private static async editInfo(field: ProductField, info: any) {
        field.name = info.name;
        field.type = info.type;

        return await field.save();
    }

    static async add(info: any) {
        return await CProductField.editInfo(new ProductField(), info);
    }

    static async update(info: any) {
        return await CProductField.editInfo(<ProductField>await ProductField.findById(info.id), info);
    }

    static async delById(id: string) {
        await ProductField.delById(id);
    }

}
