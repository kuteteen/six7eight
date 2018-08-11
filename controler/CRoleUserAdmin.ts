import * as debuger from "debug";
import {RoleUserAdmin} from "../entity/RoleUserAdmin";
import {MsgRes} from "../utils";

const debug = (info: any, msg?: string) => {
    const debug = debuger('six7eight:CRoleUserAdmin_saveOne ');
    debug(JSON.stringify(info) + '  ' + msg);
};

export class CRoleUserAdmin {

    static async allRoles() {
        return await RoleUserAdmin.getAll();
    }

    static async saveOne(info:any){
        let role = new RoleUserAdmin();
        role.name = info.name;
        role.rights = info.rights;
        try {
            return new MsgRes(true, '', await role.save());
        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return new MsgRes(false, '角色 "' + role.name + '" 已经存在！');
            } else {
                debug(e, '保存平台管理员角色失败！');
                return new MsgRes(false, '添加角色失败！(未知错误，请联系开发人员)');
            }
        }
    }

    static async update(info: any) {
        let role = new RoleUserAdmin();
        role.name = info.name;
        role.rights = info.rights;
        return await RoleUserAdmin.update(info.id, role);
    }

    static async delById(id: string) {
        let role = <RoleUserAdmin>await RoleUserAdmin.findByIdWithRelations(id);
        if (role.users && role.users.length > 0) {
            return false;
        }else{
            await RoleUserAdmin.delById(id);
            return true;
        }
    }
}