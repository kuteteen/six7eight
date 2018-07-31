import {Column, CreateDateColumn, PrimaryGeneratedColumn, Timestamp} from "typeorm";

export abstract class RoleBase {
    // 角色ID
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // 角色名称
    @Column({
        type: 'char',
        length: 60,
        unique: true
    })
    name!: string;

    // 角色创建时间
    @Column({
        type: "timestamp",
        readonly: true
    })
    @CreateDateColumn()
    readonly createTime!: Timestamp;
}