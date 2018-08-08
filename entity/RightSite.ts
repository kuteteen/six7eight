import {Entity, Tree, TreeChildren, TreeParent} from "typeorm";
import {RightBase} from "./RightBase";

@Entity()
@Tree('closure-table')
export class RightSite extends RightBase{
    // 父权限
    @TreeParent()
    parent?: RightSite;

    // 子权限
    @TreeChildren()
    children?: RightSite[];

}